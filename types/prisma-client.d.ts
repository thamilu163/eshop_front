declare module '@prisma/client' {
  export class PrismaClient {
    constructor(): void;
    productImage: any;
    product: any;
    $disconnect(): Promise<void>;
  }
  export { PrismaClient };
}
