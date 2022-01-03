import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class BroadcastService {

	private data = new Subject<any>();

	Broadcasted = this.data.asObservable();

	Data(data, type) {

        data.b_type = type;

		this.data.next(data);
	}
}