import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { finalize, map, startWith, Subject, takeUntil } from 'rxjs';

import { FiltersService } from './api/filters.service';

export interface Breed {
  name: string;
  id: string;
}

export interface CatImages {
  url: string;
}

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit, OnDestroy {
  limits = ['10', '20', '40', '80']
  form = this.fb.group({
    breedId: this.fb.control<string>(''),
    limit: this.fb.control(this.limits[0])
  })
  filteredBreeds$: Subject<Breed[]> = new Subject<Breed[]>();
  breedSearch = this.fb.control<string>('');
  catImages: CatImages[] = [];
  isLoading = false;

  private unsubscribe$ = new Subject<void>();
  private breeds: Breed[] = [];

  constructor(private readonly filtersService: FiltersService, private readonly fb: FormBuilder) {
  }

  ngOnInit() {
    this.getBreads();

    this.breedSearch.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.filterCats();
      });

    this.form.valueChanges
      .pipe(
        startWith(this.form.value),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(({breedId, limit}) => {
        this.getCats(limit as string, breedId as string);
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getBreads() {
    this.filtersService.getBreads().pipe(
      map(value => {
        return [
          {name: 'All', id: ''},
          ...value
        ];
      }),
      takeUntil(this.unsubscribe$))
      .subscribe(value => {
        this.breeds = value
        this.filterCats()
      })
  }

  private getCats(limit: string, id: string) {
    this.isLoading = true

    this.filtersService.getCats(limit, id).pipe(
      takeUntil(this.unsubscribe$),
      finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(value => {
        this.catImages = value
      })
  }

  private filterCats() {
    if (!this.breeds) {
      return;
    }
    let search = this.breedSearch.value;
    if (!search) {
      this.filteredBreeds$.next(this.breeds.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredBreeds$.next(
      this.breeds.filter(bank => bank.name.toLowerCase().indexOf(search as string) > -1)
    );
  }
}
