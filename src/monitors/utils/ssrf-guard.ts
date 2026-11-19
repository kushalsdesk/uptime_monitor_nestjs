import { BadRequestException } from '@nestjs/common';
import { lookup } from 'dns/promises';

export async function assertSafeUrl(urlString: string): Promise<void> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new BadRequestException('Invalid URL format');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BadRequestException('only HTTP and HTTPS are allowed');
  }

  const hostname = url.hostname;

  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname)) {
    throw new BadRequestException('Requests to localhost are not allowed');
  }

  //resolve DNS
  try {
    const { address } = await lookup(hostname);
    if (isPrivateIP(address)) {
      throw new BadRequestException(
        'Requests to private IP ranges are not allowed',
      );
    }
  } catch (error) {
    if (error instanceof BadRequestException) throw error;
    throw new BadRequestException('Could not resolve hostname');
  }
}

function isPrivateIP(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;

  // 10.0.0.0/8
  if (parts[0] === 10) return true;
  // 172.16.0.0/12
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;
  // 169.254.0.0/16 (AWS Metadata)
  if (parts[0] === 169 && parts[1] === 254) return true;
  // 127.0.0.0/8
  if (parts[0] === 127) return true;

  return false;
}
