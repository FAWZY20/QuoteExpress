import { Injectable } from '@angular/core';
import { Devis } from '../modelData/devis';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Alignment, Column, Columns, Styles } from 'docx';
import { style } from '@angular/animations';
import { DevisTab } from '../modelData/devisTab';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  tableBody = (devis: Devis) => [
    [
      { text: 'Description', fillColor: '#E7E6E6', alignment: 'center', widths: '17%' },
      devis.devisTab.some(item => item.quantiteCell) ? { text: 'Quantité', fillColor: '#E7E6E6', alignment: 'center', widths: '17%' } : null,
      devis.devisTab.some(item => item.uniteCell) ? { text: 'Unité', fillColor: '#E7E6E6', alignment: 'center', widths: '17%' } : null,
      { text: 'Prix unitaire HT', fillColor: '#E7E6E6', alignment: 'center', widths: '17%' },
      devis.devisTab.some(item => item.tvaCell) ? { text: 'Taux TVA', fillColor: '#E7E6E6', alignment: 'center', widths: '17%' } : null,
      { text: 'Prix total HT', fillColor: '#E7E6E6', alignment: 'center', widths: '17%' }
    ].filter(cell => cell !== null),

    ...devis.devisTab.map(item =>
      [
        `${item.titre}\n ${item.description}`,
        item.quantiteCell ? `${item.quantite}` : null,
        item.uniteCell ? `${item.unite}` : null,
        `${item.prixUnitaire} ${devis.moneyUnite}`,
        item.tvaCell ? `${item.tva} %` : null,
        `${item.prixTotal} ${devis.moneyUnite}`,
      ].filter(cell => cell !== null)
    )
  ];

  cellWidth = (devis: Devis): any => {
    if (!devis.devisTab.some(item => item.quantiteCell) || !devis.devisTab.some(item => item.uniteCell) || !devis.devisTab.some(item => item.tvaCell)) {
      return ['27%', '17%', '17%', '17%', '17%']
    } if (!devis.devisTab.some(item => item.quantiteCell) && !devis.devisTab.some(item => item.uniteCell) ||
      !devis.devisTab.some(item => item.tvaCell) && !devis.devisTab.some(item => item.uniteCell) ||
      !devis.devisTab.some(item => item.quantiteCell) && !devis.devisTab.some(item => item.tvaCell)) {
      return ['35%', '23%', '23%', '23%']
    } if (!devis.devisTab.some(item => item.quantiteCell) && !devis.devisTab.some(item => item.uniteCell) && !devis.devisTab.some(item => item.tvaCell)) {
      return ['50%', '50%', '50%']
    } else {
      return ['30%', '15%', '15%', '15%', '15%', '15%']
    }
  }

  bodyTableTotal = (devis: Devis) => {
    const body = [];

    if (devis.tvaTotal > 0) {
      body.push([
        { text: 'Total HT', style: 'titleTabTotal', fillColor: '#E7E6E6' },
        { text: `${devis.totalHt} ${devis.moneyUnite}`, style: 'valueTotalTab' }
      ]);
      body.push([
        { text: `TVA (${devis.tva}%)`, style: 'titleTabTotal', fillColor: '#E7E6E6' },
        { text: `${devis.tvaTotal} ${devis.moneyUnite}`, style: 'valueTotalTab' }
      ]);
    }

    body.push([
      { text: 'Total TTC', style: 'titleTabTotal', fillColor: '#E7E6E6' },
      { text: `${devis.totalTtc} ${devis.moneyUnite}`, style: 'valueTotalTab' }
    ]);

    return body;
  };

  generatePdf(devis: Devis) {
    const documentDefinition: any = {
      content: [
        ...(devis.logoDevis ? [{
          image: devis.logoDevis,
          width: 90,
          height: 90,
          alignment: 'left',
          margin: [0, 0, 0, 5]
        }] : []),
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: `${devis.societe}\n`, style: 'companyInfo' },
                { text: `${devis.adresseSociete}\n`, style: 'companyInfo' },
                { text: `${devis.codePostalSociete} ${devis.villeSociete}\n`, style: 'companyInfo' },
                { text: `Siret : ${devis.siretSociete}\n`, style: 'companyInfo' },
                { text: `N° TVA : ${devis.tvaSociete}\n`, style: 'companyInfo' },
                { text: `Tél : ${devis.telSociete}\n`, style: 'companyInfo' }
              ]
            }
          ]
        },
        {
          columns: [
            {
              stack: [
                { text: `${devis.nomClient}`, style: ['clientInfo', 'top'] },
                { text: `${devis.adresseClient}`, style: 'clientInfo' },
                { text: `${devis.codePostalClient}`, style: 'clientInfo' },
                { text: `${devis.villeClient}`, style: 'clientInfo' },
                { text: `Siret : ${devis.siretClient}`, style: 'clientInfo' },
                { text: `Tél : ${devis.telClient}`, style: ['clientInfo', 'bottom'] }
              ]
            }
          ]
        },
        {
          columns: [
            {
              table: {
                widths: ['18%', '18%'],
                body: [
                  [
                    { text: 'Date du devis', style: 'devisDate', fillColor: '#E7E6E6' },
                    { text: `${devis.dateDevis}`, style: 'devisDate' }
                  ]
                ]
              },
              style: 'date'
            }
          ]
        },
        {
          columns: [
            {
              table: {
                widths: this.cellWidth(devis),
                body: this.tableBody(devis)
              }
            }
          ],
          style: 'tabDevis'
        },
        {
          columns: [
            {

              text: `${devis.info}`,
              style: 'infoDevis'
            },
            {
              table: {
                body: this.bodyTableTotal(devis),
              },
              style: 'tabTotal'
            }
          ],
          style: 'colTotal'
        }
      ],
      styles: {
        devisDate: {
          alignment: 'center',
          margin: [0, 5, 0, 5]
        },
        valueTotalTab: {
          margin: [50, 5, 50, 5]
        },
        titleTabTotal: {
          margin: [20, 5, 20, 5],
          alignment: 'center'
        },
        tabTotal: {
          alignment: 'right',
        },
        clientInfo: {
          alignment: 'right',
        },
        top: {
          margin: [0, 10, 0, 0]
        },
        bottom: {
          margin: [0, 0, 0, 40]
        },
        colTotal: {
          margin: [0, 200, 0, 0]
        },
        tabDevis: {
          margin: [0, 30, 0, 0]
        }
      }
    }
    const pdfDoc = pdfMake.createPdf(documentDefinition);
    pdfDoc.download('devis.pdf');
  }
}
