import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-reporte-peliculas',
  templateUrl: './reporte-peliculas.component.html',
  styleUrls: ['./reporte-peliculas.component.css']
})
export class ReportePeliculasComponent implements OnInit {
  peliculas: any[] = [];
  generoSeleccionado: string = '';
  anioLanzamientoSeleccionado: number | null = null;

  constructor(private http: HttpClient) {
    (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit() {
    this.http.get<any[]>('./assets/peliculas.json').subscribe(data => {
      this.peliculas = data;
    });
  }

  generarPDF() {
    const peliculasFiltradas = this.peliculas.filter(pelicula => {
      if (this.generoSeleccionado && pelicula.genero !== this.generoSeleccionado) {
        return false; // No coincide con el género seleccionado
      }
      return true; // Coincide con todos los criterios de filtro
    });
  
    const contenido = [
      { text: 'Informe de Películas', style: 'header' },
      { text: '\n\n' },
      {
        style: 'table',
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'Título', style: 'tableHeader' },
              { text: 'Género', style: 'tableHeader' },
              { text: 'Año de lanzamiento', style: 'tableHeader' }
            ],
            ...peliculasFiltradas.map(pelicula => [pelicula.titulo, pelicula.genero, pelicula.lanzamiento.toString()])
          ]
        }
      }
    ];
  
    const estilos = {
      header: {
        fontSize: 24,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 20],
        color: '#c0392b' // Color de texto rojo oscuro
      },
      table: {
        margin: [0, 10, 0, 10],
        fillColor: '#f2f2f2' // Color de fondo gris claro para la tabla
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        fillColor: '#c0392b', // Color de fondo rojo oscuro para la fila de encabezado
        color: '#ffffff' // Color de texto blanco para la fila de encabezado
      },
      tableRow: {
        fontSize: 10
      }
    };
  
    const documentDefinition: any = {
      content: contenido,
      styles: estilos
    };
  
    pdfMake.createPdf(documentDefinition).open();
  }
  
  

  exportarExcel() {
    const peliculasFiltradas = this.peliculas.filter(pelicula => {
      if (this.generoSeleccionado && pelicula.genero !== this.generoSeleccionado) {
        return false; // No coincide con el género seleccionado
      }
      if (this.anioLanzamientoSeleccionado && pelicula.lanzamiento !== this.anioLanzamientoSeleccionado) {
        return false; // No coincide con el año de lanzamiento seleccionado
      }
      return true; // Coincide con todos los criterios de filtro
    });
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(peliculasFiltradas);
    const wb: XLSX.WorkBook = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'informe-peliculas.xlsx');
  }
}