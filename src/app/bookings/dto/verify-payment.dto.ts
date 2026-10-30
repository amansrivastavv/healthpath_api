import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({
    example: 'order_PU3bQx1zY2a3b4',
    description: 'Razorpay Order ID returned by backend during booking creation',
  })
  @IsString()
  @IsNotEmpty({ message: 'razorpayOrderId is required' })
  razorpayOrderId: string;

  @ApiProperty({
    example: 'pay_PU3cDe5fG6h7i8',
    description: 'Razorpay Payment ID returned by checkout popup upon payment success',
  })
  @IsString()
  @IsNotEmpty({ message: 'razorpayPaymentId is required' })
  razorpayPaymentId: string;

  @ApiProperty({
    example: '9ef8a1c3d2e4b5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    description: 'Razorpay Signature for HMAC SHA256 verification',
  })
  @IsString()
  @IsNotEmpty({ message: 'razorpaySignature is required' })
  razorpaySignature: string;
}
