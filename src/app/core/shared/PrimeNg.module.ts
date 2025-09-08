

// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { FileUpload } from 'primeng/fileupload';
import { FloatLabel } from 'primeng/floatlabel';
import { GalleriaModule } from 'primeng/galleria';
import { IconFieldModule } from 'primeng/iconfield';
import { Image } from 'primeng/image';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgModule } from '@angular/core';
import { PrimeNG, providePrimeNG } from 'primeng/config';
import { ProgressBar } from 'primeng/progressbar';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Ripple } from 'primeng/ripple';
import { ScrollTop } from 'primeng/scrolltop';
import { SelectModule } from 'primeng/select';
import { SpeedDial } from 'primeng/speeddial';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Toast, ToastModule } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';


@NgModule({
    imports: [
        AccordionModule,
        BadgeModule,
        ButtonModule,
        CardModule,
        Checkbox,
        ConfirmDialog,
        Dialog,
        DrawerModule,
        FileUpload,
        FloatLabel,
        GalleriaModule,
        IconFieldModule,
        Image,
        InputGroup,
        InputGroupAddonModule,
        InputIconModule,
        InputTextModule,
        Message,
        MultiSelectModule,
        ProgressBar,
        Ripple,
        ScrollTop,
        SelectModule,
        SpeedDial,
        TableModule,
        TagModule,
        Toast,
        ToastModule,
        Tooltip,
    ],
    exports: [
        AccordionModule,
        BadgeModule,
        ButtonModule,
        CardModule,
        Checkbox,
        ConfirmDialog,
        Dialog,
        DrawerModule,
        FileUpload,
        FloatLabel,
        GalleriaModule,
        IconFieldModule,
        Image,
        InputGroup,
        InputGroupAddonModule,
        InputIconModule,
        InputTextModule,
        Message,
        MultiSelectModule,
        ProgressBar,
        Ripple,
        ScrollTop,
        SelectModule,
        SpeedDial,
        TableModule,
        TagModule,
        Toast,
        ToastModule,
        Tooltip,
    ],
    declarations: [],
    providers: [
        providePrimeNG({
            translation: {
                startsWith: 'Empieza con',
                contains: 'Contiene',
                notContains: 'No contiene',
                endsWith: 'Termina con',
                equals: 'Igual a',
                notEquals: 'Distinto de',
                noFilter: 'Sin filtro',
                matchAll: 'Coincidir todos',
                matchAny: 'Coincidir cualquiera',
                addRule: 'Agregar regla',
                removeRule: 'Eliminar regla',
                accept: 'Aceptar',
                reject: 'Rechazar',
                choose: 'Elegir',
                upload: 'Subir',
                cancel: 'Cancelar',
            }
        }),
        MessageService,
        ConfirmationService,
    ],
})
export class PrimeNgModule { }
