import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Breed, CatImages } from '../filters.component';

@Injectable({
  providedIn: 'root'
})
export class FiltersService {
  private readonly apiUrl = 'https://api.thecatapi.com/v1'

  constructor(private readonly httpClient: HttpClient) {
  }

  getBreads(): Observable<Breed[]> {
    return this.httpClient.get<Breed[]>(`${this.apiUrl}/breeds`)
  }

  getCats(limit: string, id: string): Observable<CatImages[]> {
    return this.httpClient.get<CatImages[]>(`${this.apiUrl}/images/search`, {
      params: {
        limit: limit,
        breed_ids: id
      },
      headers: {
        'x-api-key': 'live_M2KdETe5RPXnWyo27wmNwq365fwUbZcOKIYZmgKwRgEbsGoBmUX4WO6ntriBooKK'
      }
    })
  }
}
