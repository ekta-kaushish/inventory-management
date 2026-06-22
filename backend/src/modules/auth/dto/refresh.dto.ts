import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'The JWT refresh token' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken!: string;
}
