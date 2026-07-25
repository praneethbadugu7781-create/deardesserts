// ESC/POS Thermal Printer Helper for Web Bluetooth & RawBT

export interface ReceiptOrderData {
  tokenNumber: string;
  billNumber: string;
  customerName: string;
  paymentMethod: string;
  createdAt: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  netAmount: number;
  items: { name: string; quantity: number; price: number; totalPrice: number }[];
}

/**
 * Builds raw ESC/POS binary buffer for thermal printers
 */
export function buildEscPosBuffer(order: ReceiptOrderData): Uint8Array {
  const bytes: number[] = [];

  const addText = (str: string) => {
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i));
    }
  };

  const addLine = (str: string = '') => {
    addText(str + '\n');
  };

  // ESC @ - Initialize printer
  bytes.push(0x1b, 0x40);

  // Center alignment
  bytes.push(0x1b, 0x61, 0x01);

  // Bold double-height title
  bytes.push(0x1b, 0x45, 0x01); // Bold on
  bytes.push(0x1d, 0x21, 0x11); // Double width & height
  addLine('DEAR DESSERTS');
  bytes.push(0x1d, 0x21, 0x00); // Normal size
  bytes.push(0x1b, 0x45, 0x00); // Bold off

  addLine('Love At First Bite');
  addLine('Swathi Theatre Road, Opp. Sri Balaji Sweets');
  addLine('Bhavanipuram, Vijayawada - 520012');
  addLine('Ph: +91 98765 43210');
  addLine('GSTIN: 37AAACD1234F1Z9');
  addLine('--------------------------------');

  // Token Box (Double size)
  bytes.push(0x1b, 0x45, 0x01); // Bold
  bytes.push(0x1d, 0x21, 0x11); // Double size
  addLine(`TOKEN: ${order.tokenNumber}`);
  bytes.push(0x1d, 0x21, 0x00); // Normal size
  bytes.push(0x1b, 0x45, 0x00); // Bold off

  addLine('--------------------------------');

  // Left alignment for bill details
  bytes.push(0x1b, 0x61, 0x00);
  addLine(`Bill No : ${order.billNumber}`);
  addLine(`Date    : ${new Date(order.createdAt).toLocaleDateString('en-IN')}`);
  addLine(`Time    : ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  addLine(`Customer: ${order.customerName}`);
  addLine(`Pay Mode: ${order.paymentMethod}`);
  addLine('--------------------------------');

  // Items Header
  addLine('QTY  ITEM                   TOTAL');
  addLine('--------------------------------');

  // Item rows
  order.items.forEach((item) => {
    const qty = `${item.quantity}x`.padEnd(5);
    const name = item.name.length > 18 ? item.name.substring(0, 18) : item.name.padEnd(18);
    const price = `Rs.${item.totalPrice}`.padStart(9);
    addLine(`${qty}${name}${price}`);
  });

  addLine('--------------------------------');

  // Totals (Right align)
  bytes.push(0x1b, 0x61, 0x02);
  addLine(`Subtotal: Rs.${order.subtotal}`);
  addLine(`GST (5%): Rs.${order.taxAmount}`);
  if (order.discountAmount > 0) {
    addLine(`Discount: -Rs.${order.discountAmount}`);
  }

  // Bold NET TOTAL
  bytes.push(0x1b, 0x45, 0x01);
  addLine(`TOTAL PAID (${order.paymentMethod}): Rs.${order.netAmount}`);
  bytes.push(0x1b, 0x45, 0x00);

  // Center alignment for footer
  bytes.push(0x1b, 0x61, 0x01);
  addLine('--------------------------------');
  addLine('Thank you for visiting Dear Desserts!');
  addLine('Please watch Token Display Screen');
  addLine('\n\n\n');

  // Paper cut command (GS V 66 0)
  bytes.push(0x1d, 0x56, 0x42, 0x00);

  return new Uint8Array(bytes);
}

/**
 * Print directly via Web Bluetooth API (navigator.bluetooth in Chrome on Android)
 */
export async function printViaWebBluetooth(order: ReceiptOrderData): Promise<boolean> {
  if (typeof window === 'undefined' || !('bluetooth' in navigator)) {
    throw new Error('Web Bluetooth API is not supported in this browser. Please use Chrome on Android.');
  }

  const device = await (navigator as any).bluetooth.requestDevice({
    filters: [
      { services: ['000018f0-0000-1000-8000-00805f9b34fb'] },
      { services: ['00001101-0000-1000-8000-00805f9b34fb'] },
      { namePrefix: 'POS' },
      { namePrefix: 'RP' },
      { namePrefix: 'InnerPrinter' },
      { namePrefix: 'Bluetooth' },
    ],
    optionalServices: [
      '000018f0-0000-1000-8000-00805f9b34fb',
      '00001101-0000-1000-8000-00805f9b34fb',
      '49535343-fe7d-4ae5-8fa9-9fafd205e455',
    ],
  });

  const server = await device.gatt.connect();
  const services = await server.getPrimaryServices();
  if (services.length === 0) throw new Error('No Bluetooth GATT service found on printer.');

  let targetChar: any = null;
  for (const service of services) {
    const characteristics = await service.getCharacteristics();
    for (const char of characteristics) {
      if (char.properties.write || char.properties.writeWithoutResponse) {
        targetChar = char;
        break;
      }
    }
    if (targetChar) break;
  }

  if (!targetChar) throw new Error('Printer write characteristic not found.');

  const escPosBuffer = buildEscPosBuffer(order);
  
  // Write in 100-byte chunks
  const chunkSize = 100;
  for (let i = 0; i < escPosBuffer.length; i += chunkSize) {
    const chunk = escPosBuffer.slice(i, i + chunkSize);
    await targetChar.writeValue(chunk);
  }

  return true;
}

/**
 * Print directly via RawBT intent URL (Instant 1-tap on Android)
 */
export function printViaRawBT(order: ReceiptOrderData) {
  const escPosBuffer = buildEscPosBuffer(order);
  let binary = '';
  for (let i = 0; i < escPosBuffer.length; i++) {
    binary += String.fromCharCode(escPosBuffer[i]);
  }
  const base64 = btoa(binary);
  window.location.href = `rawbt:base64,${base64}`;
}
