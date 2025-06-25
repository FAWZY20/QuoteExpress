import { DevisTab } from "./devisTab";

export class Devis{

    logoDevis: string | ArrayBuffer | null = null;
    societe:string = "";
    adresseSociete:string = "";
    codePostalSociete:string = "";
    villeSociete:string = "";
    siretSociete:string = "";
    tvaSociete:string = ""; 
    telSociete:string = "";
    nomClient:string = "";
    adresseClient:string = "";
    codePostalClient:string = "";
    villeClient:string = "";
    siretClient:string = "";
    telClient:string = "";
    dateDevis:string = "";
    infoDevis!: any[];
    totalHt:number = 0;
    tva: number = 20;
    totalTtc:number = 0;
    tvaTotal: number = 0;
    devisTab: DevisTab[] = [];
    moneyUnite: String = "€";
    info: String = "";

}