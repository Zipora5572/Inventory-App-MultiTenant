import { Injectable, inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { Item } from '../models/item';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class Inventory {
  #http = inject(HttpClient);

  getAll(): Observable<Item[]> {
    
    return this.#http.get<Item[]>(`${environment.apiUrl}/items`);
  }

  create(item: Partial<Item>): Observable<Item> {
    return this.#http.post<Item>(`${environment.apiUrl}/items`, item);
  }

  update(id: number, item: Partial<Item>): Observable<Item> {
  return this.#http.put<Item>(`${environment.apiUrl}/items/${id}`, item);
  }

  checkout(id: number): Observable<void> {
    return this.#http.post<void>(`${environment.apiUrl}/items/${id}/checkout`, {});
  }

  checkin(id: number): Observable<void> {
    return this.#http.post<void>(`${environment.apiUrl}/items/${id}/checkin`, {});
  }

  softDelete(id: number): Observable<void> {
    return this.#http.delete<void>(`${environment.apiUrl}/items/${id}`);
  }
}