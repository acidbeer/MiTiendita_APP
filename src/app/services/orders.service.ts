import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment'; 

@Injectable({ providedIn: 'root' })
export class OrdersService{
  constructor(private http:HttpClient){}
  create(items:{productId:number;quantity:number}[], lat:number, lng:number){
    return this.http.post(`${environment.api}/orders`, { items, lat, lng });
  }
}
