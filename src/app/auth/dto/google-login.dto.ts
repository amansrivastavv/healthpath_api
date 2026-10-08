import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'The ID token received from Google Sign-In',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZ...',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
