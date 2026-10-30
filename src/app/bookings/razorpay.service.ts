import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require('razorpay');

export interface RazorpayOrderResult {
  orderId: string;
  amount: number; // in paise
  amountInRupees: number;
  currency: string;
  keyId: string;
}

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private instance: any;
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(private readonly configService: ConfigService) {
    this.keyId =
      this.configService.get<string>('razorpay.keyId') ||
      process.env.RAZORPAY_KEY_ID ||
      process.env.razorpay_key_id ||
      '';

    this.keySecret =
      this.configService.get<string>('razorpay.keySecret') ||
      process.env.RAZORPAY_KEY_SECRET ||
      process.env.razorpay_key_secret ||
      '';

    if (this.keyId && this.keySecret) {
      this.instance = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret,
      });
      this.logger.log(`Razorpay initialized with keyId: ${this.keyId}`);
    } else {
      this.logger.warn('Razorpay keys are missing from configuration.');
    }
  }

  /**
   * Get public Razorpay key ID for frontend checkout
   */
  getKeyId(): string {
    return this.keyId;
  }

  /**
   * Create a Razorpay Order
   * @param amountInRupees Booking price in INR
   * @param receipt Booking reference string (e.g. HP-BK-20261030-XYZ)
   * @param notes Additional metadata notes
   */
  async createOrder(
    amountInRupees: number,
    receipt: string,
    notes: Record<string, string> = {},
  ): Promise<RazorpayOrderResult> {
    if (!this.instance) {
      throw new InternalServerErrorException(
        'Razorpay is not configured. Please check your credentials in .env.local',
      );
    }

    try {
      const amountInPaise = Math.round(amountInRupees * 100);

      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt.slice(0, 40), // Razorpay receipt max length 40
        notes,
      };

      const order = await this.instance.orders.create(options);

      return {
        orderId: order.id,
        amount: order.amount,
        amountInRupees,
        currency: order.currency,
        keyId: this.keyId,
      };
    } catch (error: any) {
      this.logger.error('Failed to create Razorpay order', error?.stack || error);
      throw new InternalServerErrorException(
        `Failed to create Razorpay order: ${error?.error?.description || error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Verify HMAC SHA256 payment signature
   * @param orderId Razorpay order ID
   * @param paymentId Razorpay payment ID
   * @param signature Signature received from client checkout
   */
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    if (!this.keySecret) {
      throw new InternalServerErrorException('Razorpay key secret not configured.');
    }

    const payload = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(payload)
      .digest('hex');

    return generatedSignature === signature;
  }

  /**
   * Fetch payment details by payment ID from Razorpay
   */
  async fetchPayment(paymentId: string) {
    if (!this.instance) {
      throw new InternalServerErrorException('Razorpay is not configured.');
    }
    return this.instance.payments.fetch(paymentId);
  }
}
