import { Injectable } from '@angular/core';
import { Packer, Document, Paragraph, TextRun, BorderStyle, Table, TableRow, TableCell, WidthType, VerticalAlign, TableAnchorType, RelativeHorizontalPosition, OverlapType, RelativeVerticalPosition, TableLayoutType, TableLayout, ImageRun } from "docx";
import { Devis } from '../modelData/devis';
import { DevisTab } from '../modelData/devisTab';
import jsPDF from 'jspdf';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Injectable({
  providedIn: 'root'
})
export class DocxService {

  base64ToUint8Array(base64: string): Uint8Array {
    try {
      // Nettoyer la chaîne base64 de tout caractère non valide
      const cleanBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');
      const binaryString = window.atob(cleanBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (error) {
      console.error('Erreur lors de la conversion base64:', error);
      throw new Error('Format base64 invalide');
    }
  }

  getImageBuffer(): Uint8Array | null {
    const imageBase64: string | null = localStorage.getItem('devis_logo');

    if (!imageBase64) {
      console.error('Aucune image trouvée dans le localStorage');
      return null;
    }

    try {
      // Nettoyer la base64 (enlever "data:image/png;base64," ou autre mimetype)
      const cleanBase64 = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');

      // Vérifier que la chaîne base64 n'est pas vide
      if (!cleanBase64.trim()) {
        console.error('Chaîne base64 vide après nettoyage');
        return null;
      }

      // Vérifier que la longueur est un multiple de 4 (ajout de padding si nécessaire)
      const paddedBase64 = cleanBase64 + '='.repeat((4 - cleanBase64.length % 4) % 4);

      const imageBuffer = this.base64ToUint8Array(paddedBase64);

      // Vérifier que le buffer n'est pas vide
      if (imageBuffer.length === 0) {
        console.error('Buffer d\'image vide');
        return null;
      }

      console.log('Image buffer créé avec succès, taille:', imageBuffer.length);
      return imageBuffer;

    } catch (error) {
      console.error('Erreur lors du traitement de l\'image:', error);
      return null;
    }
  }

  doc: any = (devis: Devis) => {
    return new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                data: this.getImageBuffer() as Uint8Array,
                transformation: {
                  width: 150,
                  height: 150,
                },
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${devis.societe}`,
                break: 1
              }),
              new TextRun({
                text: `${devis.adresseSociete}`,
                break: 1
              }),
              new TextRun({
                text: `${devis.codePostalSociete}`,
                break: 1
              }),
              new TextRun({
                text: `${devis.villeSociete}`,
                break: 1
              }),
              new TextRun({
                text: `Siret : ${devis.siretSociete}`,
                break: 1
              }),
              new TextRun({
                text: `N° TVA : ${devis.tvaSociete}`,
                break: 1
              }),
              new TextRun({
                text: `Tél : ${devis.telSociete}`,
                break: 1
              }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${devis.nomClient}`,
                break: 1
              }),
              new TextRun({
                text: `${devis.adresseClient}`,
                break: 1
              }),
              new TextRun({
                text: `${devis.codePostalClient}`,
                break: 1
              }),
              new TextRun({
                text: `${devis.villeClient}`,
                break: 1
              }),
              new TextRun({
                text: `Siret : ${devis.siretClient}`,
                break: 1
              }),
              new TextRun({
                text: `Tél : ${devis.telClient}`,
                break: 1
              }),
            ],
            alignment: "right",
          }),
          new Paragraph({
            children: [
              new TextRun({
                break: 2
              })
            ]
          }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 1505,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        alignment: "center",
                        children: [
                          new TextRun({
                            text: "Date du devis"
                          })
                        ]
                      })
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                    margins: {
                      bottom: 100,
                      top: 100,
                      left: 70,
                      right: 70
                    },
                    shading: {
                      fill: "#E7E6E6"
                    }
                  }),
                  new TableCell({
                    width: {
                      size: 1505,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun(`${devis.dateDevis}`)
                        ]
                      })
                    ],
                    margins: {
                      bottom: 100,
                      top: 100,
                      left: 70,
                      right: 70
                    }
                  })
                ]
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                break: 2
              })
            ]
          }),
          new Table({
            columnWidths: [4505, 4505],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 4505,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        alignment: "center",
                        children: [
                          new TextRun({
                            text: "Description",
                          })
                        ]
                      })
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                    margins: {
                      bottom: 70,
                      top: 70,
                      left: 70,
                      right: 70
                    },
                    shading: {
                      fill: "#E7E6E6"
                    }
                  }),
                  this.quantiteCell(devis, "#E7E6E6", "Quantité"),
                  this.uniteCell(devis, "#E7E6E6", "Unité"),
                  new TableCell({
                    width: {
                      size: 4505,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        alignment: "center",
                        children: [
                          new TextRun({
                            text: "Prix unitaire HT"
                          })
                        ]
                      })
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                    margins: {
                      bottom: 70,
                      top: 70,
                      left: 70,
                      right: 70
                    },
                    shading: {
                      fill: "#E7E6E6"
                    }
                  }),
                  this.tvaCell(devis, "#E7E6E6", "Taux TVA"),
                  new TableCell({
                    width: {
                      size: 4505,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        alignment: "center",
                        children: [
                          new TextRun({
                            text: "Prix total HT"
                          })
                        ]
                      })
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                    margins: {
                      bottom: 70,
                      top: 70,
                      left: 70,
                      right: 70
                    },
                    shading: {
                      fill: "#E7E6E6"
                    }
                  })
                ]
              }),
              ...devis.devisTab.map(rst =>
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun(rst.titre)
                          ]
                        }),
                        new Paragraph({
                          children: [
                            new TextRun(rst.description)
                          ]
                        })
                      ],
                      margins: {
                        bottom: 70,
                        top: 70,
                        left: 70,
                        right: 70
                      },
                    }),
                    this.quantiteCell(devis, "#FFFFFF", rst.quantite),
                    this.uniteCell(devis, "#FFFFFF", rst.unite),
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: "center",
                          children: [
                            new TextRun(`${rst.prixUnitaire} ${devis.moneyUnite}`)
                          ]
                        })
                      ]
                    }),
                    this.tvaCell(devis, "#FFFFFF", rst.tva),
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: "center",
                          children: [
                            new TextRun(`${rst.prixTotal} ${devis.moneyUnite}`)
                          ]
                        })
                      ]
                    }),
                  ]
                })
              )
            ]
          }),
          this.infoPlus(devis),
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 2505,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        alignment: "center",
                        children: [
                          new TextRun("Total HT")
                        ]
                      })
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                    margins: {
                      bottom: 70,
                      top: 70,
                      left: 70,
                      right: 70
                    },
                    shading: {
                      fill: "#E7E6E6"
                    }
                  }),
                  new TableCell({
                    width: {
                      size: 2030,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        indent: {
                          left: 100
                        },
                        children: [
                          new TextRun(`${devis.totalHt} ${devis.moneyUnite}`)
                        ]
                      })
                    ]
                  })
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 2505,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        alignment: "center",
                        children: [
                          new TextRun("TVA (" + `${devis.tva}` + "%)")
                        ]
                      })
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                    margins: {
                      bottom: 70,
                      top: 70,
                      left: 70,
                      right: 70
                    },
                    shading: {
                      fill: "#E7E6E6"
                    }
                  }),
                  new TableCell({
                    width: {
                      size: 2030,
                      type: WidthType.DXA,
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        indent: {
                          left: 100
                        },
                        children: [
                          new TextRun(`${devis.tvaTotal}`)
                        ]
                      })
                    ]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 2505,
                      type: WidthType.DXA,
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        alignment: "center",
                        children: [
                          new TextRun("Total TTC")
                        ]
                      })
                    ],
                    margins: {
                      bottom: 70,
                      top: 70,
                      left: 70,
                      right: 70
                    },
                    shading: {
                      fill: "#E7E6E6"
                    }
                  }),
                  new TableCell({
                    verticalAlign: VerticalAlign.CENTER,
                    width: {
                      size: 2030,
                      type: WidthType.DXA,
                    },
                    children: [
                      new Paragraph({
                        indent: {
                          left: 100
                        },
                        children: [
                          new TextRun(`${devis.totalTtc} ${devis.moneyUnite}`)
                        ]
                      })
                    ]
                  })
                ]
              })
            ],
            alignment: 'right',
            width: {
              size: 3535,
              type: WidthType.DXA,
            },
            layout: TableLayoutType.FIXED,
          })
        ]
      }],
    });

  };


  constructor() { }

  generateDocx(doc: Document) {
    Packer.toBlob(doc).then(async blob => {
      // Télécharger le fichier DOCX
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = url;
      a.download = "Devis.docx";
      console.log("voici le lien " + a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }

  infoPlus(devis: Devis): Paragraph {
    if (devis.info == null) {
      return new Paragraph({
        children: [
          new TextRun({
            break: 2
          }),
          new TextRun({
            text: " "
          }),
          new TextRun({
            break: 2
          })
        ]
      })
    } else {
      return new Paragraph({
        children: [
          new TextRun({
            break: 2
          }),
          new TextRun({
            text: `${devis.info}`
          }),
          new TextRun({
            break: 2
          })
        ]
      })
    }
  }


  uniteCell(devis: Devis, color: string, contenu: any): TableCell | any {
    let uniteCell: TableCell | any;
    devis.devisTab.forEach(rst => {
      if (rst.uniteCell == true) {
        uniteCell = new TableCell({
          children: [
            new Paragraph({
              alignment: "center",
              children: [
                new TextRun(`${contenu}`)
              ]
            })
          ],
          width: {
            size: 4505,
            type: WidthType.DXA,
          },
          verticalAlign: VerticalAlign.CENTER,
          margins: {
            bottom: 70,
            top: 70,
            left: 70,
            right: 70
          },
          shading: {
            fill: color
          }
        });
      }
    })
    return uniteCell;
  }

  quantiteCell(devis: Devis, color: string, contenu: any): TableCell | any {
    let uniteCell: TableCell | any;
    devis.devisTab.forEach(rst => {
      if (rst.quantiteCell == true) {
        uniteCell = new TableCell({
          children: [
            new Paragraph({
              alignment: "center",
              children: [
                new TextRun(`${contenu}`)
              ]
            })
          ],
          width: {
            size: 4505,
            type: WidthType.DXA,
          },
          verticalAlign: VerticalAlign.CENTER,
          margins: {
            bottom: 70,
            top: 70,
            left: 70,
            right: 70
          },
          shading: {
            fill: color
          }
        });
      }
    })
    return uniteCell;
  }

  tvaCell(devis: Devis, color: string, contenu: any): TableCell | any {
    let uniteCell: TableCell | any;
    devis.devisTab.forEach(rst => {
      if (rst.tvaCell == true) {
        uniteCell = new TableCell({
          children: [
            new Paragraph({
              alignment: "center",
              children: [
                new TextRun(`${contenu} %`)
              ]
            })
          ],
          width: {
            size: 4505,
            type: WidthType.DXA,
          },
          verticalAlign: VerticalAlign.CENTER,
          margins: {
            bottom: 70,
            top: 70,
            left: 70,
            right: 70
          },
          shading: {
            fill: color
          }
        });
      }
    })
    return uniteCell;
  }




}