import { concatMap, from, of, switchMap, switchMapTo, tap, timer } from 'rxjs';
import { FirebaseService } from './services/firebase';
import {BoxService} from './services/box';

let isBusy = false;
const refreshTimer$ = timer(0, 5000).pipe(
    switchMap(() => FirebaseService.AllDocsFromCollection$('BoxSync')),
    concatMap(docs => from(docs)),
    tap(console.log)
);

of(null).pipe(
    tap(() => console.log('LABoxSync starting...')),
    switchMap(() => refreshTimer$)
).subscribe(() => { });
