export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
}

export interface SendMailResult {
  messageId: string;
}
