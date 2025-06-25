import { Component } from '@angular/core';
import { Devis } from 'src/app/modelData/devis';

@Component({
  selector: 'app-pdf-generator',
  templateUrl: './pdf-generator.component.html',
  styleUrls: ['./pdf-generator.component.css']
})
export class PdfGeneratorComponent {
  devisJson: any;
  devisTabJson: any;
  logoDevis: string | ArrayBuffer | null = null;;

  constructor() {
    // Récupérer les données du stockage local dans le constructeur
    const devisData = localStorage.getItem("devis");
    const devisTabData = localStorage.getItem("mapData");
    const logoDevis = localStorage.getItem("devis_logo");
    console.log('Logo from storage:', logoDevis);
     
    // Vérifier si les données existent avant de les parser
    if (devisData) {
      this.devisJson = JSON.parse(devisData);
    }

    if (devisTabData) {
      this.devisTabJson = JSON.parse(devisTabData);
    }
  }

  print() {
    window.print();
  }
}
