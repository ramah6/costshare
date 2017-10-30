import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { CostCs } from './cost-cs.model';
import { CostCsPopupService } from './cost-cs-popup.service';
import { CostCsService } from './cost-cs.service';
import { CSGroupCs, CSGroupCsService } from '../c-s-group';
import { ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-cost-cs-dialog',
    templateUrl: './cost-cs-dialog.component.html'
})
export class CostCsDialogComponent implements OnInit {

    cost: CostCs;
    isSaving: boolean;

    csgroups: CSGroupCs[];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private costService: CostCsService,
        private cSGroupService: CSGroupCsService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.cSGroupService.query()
            .subscribe((res: ResponseWrapper) => { this.csgroups = res.json; }, (res: ResponseWrapper) => this.onError(res.json));
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.cost.id !== undefined) {
            this.subscribeToSaveResponse(
                this.costService.update(this.cost));
        } else {
            this.subscribeToSaveResponse(
                this.costService.create(this.cost));
        }
    }

    private subscribeToSaveResponse(result: Observable<CostCs>) {
        result.subscribe((res: CostCs) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError());
    }

    private onSaveSuccess(result: CostCs) {
        this.eventManager.broadcast({ name: 'costListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }

    trackCSGroupById(index: number, item: CSGroupCs) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-cost-cs-popup',
    template: ''
})
export class CostCsPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private costPopupService: CostCsPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.costPopupService
                    .open(CostCsDialogComponent as Component, params['id']);
            } else {
                this.costPopupService
                    .open(CostCsDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}