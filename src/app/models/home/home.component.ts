import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { Devis } from 'src/app/modelData/devis';
import { DevisTab } from 'src/app/modelData/devisTab';
import { DocxService } from 'src/app/service/docx.service';
import { PdfGeneratorComponent } from 'src/app/components/pdf-generator/pdf-generator.component';
import { Route, Router } from '@angular/router';
import { PdfService } from 'src/app/service/pdf.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  logoPreview: string | ArrayBuffer | null = null;
  downloadLink: string | null = null;
  devis: Devis;
  currentDate: Date = new Date();
  quantite: boolean = true;
  tva: boolean = true;
  tvaLigne: boolean = false;
  tvaTaux: number = 20
  uniteValue: string = "€";
  unite: boolean = false;
  totalHt: number = 0;
  totalTva: number = 0;
  totalTTC: number = 0;
  tvaTT: number = 0;

  donneeTab: DevisTab[] = [
    { id: 1, titre: '', description: '', quantiteCell: true, quantite: 1, uniteCell: false, unite: '', tvaCell: false, prixUnitaire: 0, prixTotal: 0, tva: 20, affichage: false }
  ];

  constructor(
    private pdfService: PdfService,
    private docxService: DocxService,
    private router: Router,
  ) {
    this.devis = new Devis();
  }

  ngOnInit(): void {
    localStorage.removeItem('devis_logo');
  }


  onLogoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result as string;
        localStorage.setItem('devis_logo', this.logoPreview);
      };
      reader.readAsDataURL(file);
    }
  }

  calculPrixTotalHT(donne: any) {
    //prix total d'un element du devis
    let total = donne.quantite * donne.prixUnitaire;
    donne.prixTotal = total
  }

  calculPrixTotalDevisHT() {
    //prix total HT du devis 
    this.totalHt = 0;
    this.donneeTab.forEach((item: any) => {
      this.totalHt += item.quantite * item.prixUnitaire;
    });
    this.devis.totalHt = this.totalHt;
    return this.totalHt;
  }

  calculTva() {
    this.totalTva = this.totalHt * this.tvaTaux / 100;
    this.devis.tvaTotal = this.totalTva;
    return this.totalTva;
  }

  calculTotalTva() {
    this.tvaTT = 0;
    this.donneeTab.forEach((item: any) => {
      this.tvaTT += item.prixTotal * item.tva / 100;
    });
    this.devis.tvaTotal = this.tvaTT;
    return this.tvaTT;
  }

  CalculTotalTTC() {
    this.totalTTC = this.totalHt + this.totalTva;
    this.devis.totalTtc = this.totalTTC;
    return this.totalTTC;
  }

  generateDevis(): void {
    this.devis.devisTab = this.donneeTab.slice();
    const document = this.docxService.doc(this.devis);
    this.docxService.generateDocx(document);
  }

  generatePDf() {
    this.devis.devisTab = this.donneeTab.slice();
    this.devis.logoDevis = localStorage.getItem('devis_logo') || '';
    this.pdfService.generatePdf(this.devis)
  }

  printDevis(): void {
    localStorage.setItem('mapData', JSON.stringify(this.donneeTab));
    localStorage.setItem("devis", JSON.stringify(this.devis));
    this.router.navigate(['/devis']).then(() => {
      setTimeout(() => {
        window.print();
        localStorage.clear();
        this.router.navigate(['/'])
      }, 1000);
    });
  }

  addColumn() {
    this.donneeTab.map(result => {
      result.affichage = true;
    })
    const nouvelleLigne = { id: this.donneeTab.length + 1, titre: '', description: '', quantiteCell: true, tvaCell: false, quantite: 1, uniteCell: false, unite: '', prixUnitaire: 0, tva: 20, prixTotal: 0, affichage: false };
    this.donneeTab.push(nouvelleLigne);
    localStorage.setItem('mapData', JSON.stringify(this.donneeTab));
  }

  deleteColumn(id: number) {
    this.donneeTab.forEach(rst => {
      if (rst.id == id) {
        this.devis.totalHt = this.totalHt - rst.prixTotal;
      }
    })
    this.donneeTab = this.donneeTab.filter(resulte => resulte.id !== id);

  }

  addColumQuantite() {
    this.quantite = true;
    this.donneeTab.forEach(rst => {
      rst.quantiteCell = true;
    })
  }


  deleteColumQuantite() {
    this.quantite = false;
    this.donneeTab.forEach(rst => {
      rst.quantiteCell = false;
    })
  }

  addColumnUnite() {
    this.unite = true;
    this.donneeTab.forEach(rst => {
      rst.uniteCell = true;
      console.log(rst);
    })
  }

  deleteColumnUnite() {
    this.unite = false;
    this.donneeTab.forEach(rst => {
      rst.uniteCell = false;
    })
  }

  addTva() {
    this.tva = true;
  }

  deleteTva() {
    this.tva = false;
  }


  addTvaLigne() {
    this.tvaLigne = true;
    this.donneeTab.forEach(rst => {
      rst.tvaCell = true;
    })
  }

  deleteTvaLigne() {
    this.tvaLigne = false;
    this.donneeTab.forEach(rst => {
      rst.tvaCell = false;
    })
  }

  changeUnitee(unitee: string): void {
    this.uniteValue = unitee;
    this.devis.moneyUnite = this.uniteValue;
    this.donneeTab.forEach(rst => {
      rst.unite = this.uniteValue
    })
  }

  changeTaux(taux: number): void {
    this.tvaTaux = taux;
    this.devis.tva = this.tvaTaux;
  }

}
