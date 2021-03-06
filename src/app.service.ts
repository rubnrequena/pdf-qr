import { Injectable } from '@nestjs/common';
import { PdfDTO } from './dto/pdf.dto';

import *  as QRCode from 'qrcode'
import { PDFDocument } from 'pdf-lib';

import * as fs from 'fs'
import * as path from 'path'
import { Point, QROptions } from './interfaces/QROptions';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  printQR(pdf: PdfDTO, qrOptions: QROptions = { page: 1, scale: 1, payload: 'Hello Kubide' }): Promise<Uint8Array> {
    return new Promise(async (resolve, reject) => {
      const pdfBytes = fs.readFileSync(pdf.path);
      let pdfDoc: PDFDocument;
      try {
        pdfDoc = await PDFDocument.load(pdfBytes)
      } catch (e) {
        return reject(e)
      }
      const pages = pdfDoc.getPages();
      const pageIndex = qrOptions.page > 0 ? qrOptions.page - 1 : pages.length - Math.abs(qrOptions.page);
      if (pageIndex > pages.length - 1) {
        throw new Error("Page do not exists");
      }
      const currentPage = pages[pageIndex];

      const pdfQRUrl = path.resolve(`assets/qr/${pdf.filename}.jpg`)
      await QRCode.toFile(pdfQRUrl, qrOptions.payload);
      const qrImageBytes = fs.readFileSync(pdfQRUrl)
      const qrImage = await pdfDoc.embedPng(qrImageBytes);
      const qrScale = qrImage.scale(Number(qrOptions.scale));
      let qrLocation: Point = {
        x: currentPage.getWidth() / 2 - qrScale.width / 2,
        y: currentPage.getHeight() / 2 - qrScale.height / 2
      }
      if (qrOptions.x != '') qrLocation.x = Number((currentPage.getWidth() - qrScale.width) - Number(qrOptions.x));
      if (qrOptions.y != '') qrLocation.y = Number((currentPage.getHeight() - qrScale.height) - Number(qrOptions.y));

      currentPage.drawImage(qrImage, {
        width: qrScale.width,
        height: qrScale.height,
        x: qrLocation.x,
        y: qrLocation.y,
      })

      const pdfFinalBytes = await pdfDoc.save();

      fs.writeFileSync(path.resolve(`assets/pdf/${pdf.filename}.pdf`), pdfFinalBytes)
      resolve(pdfFinalBytes);
    });
  }
}
