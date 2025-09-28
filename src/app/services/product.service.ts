    import { HttpClient } from '@angular/common/http';
    import { Injectable } from '@angular/core';
    import { environment } from 'src/environments/environment';
    import { Observable } from 'rxjs';
    import { Product } from '../models/product.model';

    @Injectable({providedIn:'root'})
    export class ProductService{
    private readonly api = environment.api;

    constructor(private http: HttpClient) {}

    list(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.api}/products`);
    }

    create(p: Partial<Product>) { 
        return this.http.post<Product>(`${environment.api}/products`, p);
    }

    update(id: number, p: Partial<Product>) {
        return this.http.put<Product>(`${environment.api}/products/${id}`, p); 
    }

    remove(id: number) { return this.http.delete<void>(`${environment.api}/products/${id}`); }




    upload(file: File): Observable<{ url: string }> {
        const fd = new FormData();
        fd.append('file', file);
        return this.http.post<{ url: string }>(`${this.api}/upload`, fd);
    }

    one(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.api}/products/${id}`);
    }
    
    }