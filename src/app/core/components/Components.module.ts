import { BreadCrumbComponent } from './bread-crumb/bread-crumb.component';
import { ChartBarraComponent } from './chart-barra/chart-barra.component';
import { ChartFigureGirBoyComponent } from './chart-figure-gir-boy/chart-figure-gir-boy.component';
import { ChartPastelComponent } from './chart-pastel/chart-pastel.component';
import { DatosCtComponent } from './datos-ct/datos-ct.component';
import { EjercicioResultadoComponent } from './ejercicio-resultado/ejercicio-resultado.component';
import { HeaderComponent } from './header/header.component';
import { ImaebLogoComponent } from './imaeb-logo/imaeb-logo.component';
import { ItemChartResltadoAreaComponent } from './item-chart-resltado-area/item-chart-resltado-area.component';
import { ItemNivelDesempenoComponent } from './item-nivel-desempeno/item-nivel-desempeno.component';
import { ItemPorcentajeAreaEvaluadaComponent } from './item-porcentaje-area-evaluada/item-porcentaje-area-evaluada.component';
import { ItemUnidadAnalisisComponent } from './item-unidad-analisis/item-unidad-analisis.component';
import { LoaderPageComponent } from './loader-page/loader-page.component';
import { NgModule } from '@angular/core';
import { NivelDesempenoImagenComponent } from './nivel-desempeno-imagen/nivel-desempeno-imagen.component';
import { RouterModule } from '@angular/router';
import { SinglePromedioComponent } from './single-promedio/single-promedio.component';
import { TablaResultadoByCampoFormativoAciertosComponent } from './tabla-resultado-by-campo-formativo-aciertos/tabla-resultado-by-campo-formativo-aciertos.component';
import { TablaResultadosEvidenciaComponent } from './tabla-resultados-evidencia/tabla-resultados-evidencia.component';
import { TablaResultByCampoFormativoComponent } from './tabla-result-by-campo-formativo/tabla-result-by-campo-formativo.component';
import { TableResultadosGrupoComponent } from './table-resultados-grupo/table-resultados-grupo.component';
import { UnidadAnalisisPorcentajeComponent } from './unidad-analisis-porcentaje/unidad-analisis-porcentaje.component';
import { PrimeNgModule } from '../shared/PrimeNg.module';
import { HighchartsChartModule } from 'highcharts-angular';
import { ConfirmDialog } from './confirm-dialog/confirm-dialog';
import { Title } from './title/title';
import { DatosAlumno } from './datos-alumno/datos-alumno';
import { FormsModule } from '@angular/forms';
import { TablaResultadosGrupoCT } from './tabla-resultados-grupo-ct/tabla-resultados-grupo-ct';
import { Subtitle } from './subtitle/subtitle';
import { subtitle } from '@primeuix/themes/aura/card';
import { CharBarraSingleDataSet } from './char-barra-single-data-set/char-barra-single-data-set';
import { TablaDinamica } from './tabla-dinamica/tabla-dinamica';
import { Navbar } from './navbar/navbar';
@NgModule({
    imports: [
    PrimeNgModule,
    HighchartsChartModule,
    FormsModule,
    RouterModule
],
    exports: [
        HeaderComponent,
        DatosCtComponent,
        ItemUnidadAnalisisComponent,
        ItemNivelDesempenoComponent,
        LoaderPageComponent,
        ImaebLogoComponent,
        TablaResultadosEvidenciaComponent,
        ChartFigureGirBoyComponent,
        ChartPastelComponent,
        ChartBarraComponent,
        ItemChartResltadoAreaComponent,
        UnidadAnalisisPorcentajeComponent,
        ItemPorcentajeAreaEvaluadaComponent,
        EjercicioResultadoComponent,
        SinglePromedioComponent,
        TablaResultByCampoFormativoComponent,
        TableResultadosGrupoComponent,
        TablaResultadoByCampoFormativoAciertosComponent,
        BreadCrumbComponent,
        ConfirmDialog,
        Title,
        DatosAlumno,
        TablaResultadosGrupoCT,
        Subtitle,
        CharBarraSingleDataSet,
        TablaDinamica,
        Navbar
    ],
    declarations: [
        HeaderComponent,
        DatosCtComponent,
        ItemUnidadAnalisisComponent,
        ItemNivelDesempenoComponent,
        LoaderPageComponent,
        ImaebLogoComponent,
        TablaResultadosEvidenciaComponent,
        ChartFigureGirBoyComponent,
        ChartPastelComponent,
        ChartBarraComponent,
        ItemChartResltadoAreaComponent,
        UnidadAnalisisPorcentajeComponent,
        ItemPorcentajeAreaEvaluadaComponent,
        EjercicioResultadoComponent,
        SinglePromedioComponent,
        TablaResultByCampoFormativoComponent,
        NivelDesempenoImagenComponent,
        TableResultadosGrupoComponent,
        TablaResultadoByCampoFormativoAciertosComponent,
        BreadCrumbComponent,
        ConfirmDialog,
        Title,
        DatosAlumno,
        TablaResultadosGrupoCT,
        Subtitle,
        CharBarraSingleDataSet,
        TablaDinamica,
        Navbar
    ],
    providers: [],
})
export class ComponetsModule { }
