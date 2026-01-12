import RNQRGenerator, {
  QRCodeDetectOptions,
  QRCodeGenerateOptions,
} from 'rn-qr-generator';

interface QRCodeGenerateProps extends QRCodeGenerateOptions {
  value: string;
  width?: number;
  height?: number;
  base64?: boolean;
  correctionLevel: 'L' | 'M' | 'Q' | 'H';
}

interface QRCodeDetectProps extends QRCodeDetectOptions {
  uri?: string;
  base64?: string;
}

const generateQrCode = async ({
  value,
  width,
  height,
  base64,
  correctionLevel = 'H',
  ...rest
}: QRCodeGenerateProps) =>
  await RNQRGenerator.generate({
    value,
    height,
    width,
    base64,
    correctionLevel,
    ...rest,
  });

const detectQrCode = async ({ uri, base64 }: QRCodeDetectProps) =>
  await RNQRGenerator.detect({ uri, base64 });

export { generateQrCode, detectQrCode };
