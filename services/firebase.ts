import { FirebaseConfig } from './environment';
import * as firebase from 'firebase/app';
import { getFirestore, collection as fsCollection, doc as fsDoc } from 'firebase/firestore';
import { collectionChanges, doc, collection } from 'rxfire/firestore';
import { BehaviorSubject, concatAll, concatMap, expand, firstValueFrom, from, map, mergeMap, reduce, switchMap, take, tap, toArray } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import * as _ from 'underscore';


const app = firebase.initializeApp(FirebaseConfig);
export class FirebaseService {

    static get db() {
        return getFirestore(app);
    }

    static Collection$(name) {
        const collectionRef = fsCollection(FirebaseService.db, name);
        return collection(collectionRef);
    }

    static AllDocsFromCollection$(name) {
        return FirebaseService.Collection$(name)
            .pipe(
                map((docs) => _.map(docs, (d) => {
                    const data = d.data();
                    return data;
                })),
                take(1)
            );
    }

    static AllDocsFromCollectionGroup$(name, subcollection) {
        return FirebaseService.AllDocsFromCollection$(name).pipe(
            take(1),
            switchMap(async (data) => {
                for (const d of data) {
                    d[subcollection] =
                    await firstValueFrom(
                        this.AllDocsFromCollection$(
                            name + '/' + d.name.replace('/', '_._') + '/' + subcollection
                            )
                        );
                }
                return data;
            })
        );
    }

    static SubscribeToCollection$(col) {
        return collectionChanges(fsCollection(FirebaseService.db, col));
    }
    static SubscribeToDocument$(path) {
        return doc(fsDoc(FirebaseService.db, path));
    }

   static GetDocument$(col, id) {
        return doc(fsDoc(FirebaseService.db, col + '/' + id)).pipe(
            take(1)
        );
    }

}
