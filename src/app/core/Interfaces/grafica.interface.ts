export interface DataGraficaBarra{
    categorias:string[],
    firstDataSet:number[],
    secondDataSet:number[]
    firstLeyend:string,
    secondLeyend:string,
    title:string,
    description:string
}

export interface UnidadChartData{
    unidad:string,
    totalAlumnos:number,
    porcentajeAciertos:number,
    porcentajeDesaciertos:number,
    dataChart:DataGraficaBarra
}