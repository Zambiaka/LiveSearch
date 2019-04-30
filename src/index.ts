import {fromEvent, of} from 'rxjs';
import {map, switchMap, debounceTime, catchError} from "rxjs/operators";

const API_KEY: string = '12336989-2163ffb915c29e08a1d669169';
const DEBOUNCE_TIME = 400;

type hit = {
    previewURL: string,
    largeImageURL: string
};
type searchResult = {
    totalHits: number,
    hits: hit[]
}

document.addEventListener('DOMContentLoaded', function () {
    // Elem refs
    const searchInput = document.querySelector('.search');
    const resultsContainer = document.querySelector('.results-container') as HTMLDivElement;


    const input$ = fromEvent(searchInput as HTMLInputElement, 'input')
        .pipe(
            map(e => {
                const event: InputEvent = e as InputEvent;
                const target: HTMLInputElement = event.target as HTMLInputElement;

                return target.value ? buildURL(target.value) : null;
            })
        );

    const search$ = input$.pipe(
        debounceTime(DEBOUNCE_TIME),
        switchMap((value) => {
            return of(value).pipe(
                map(val => request(val)),
                catchError((err) => {
                    console.log(err);
                    return of(null);
                })
            )
        })
    )


    search$.subscribe((data) => {
        clear(resultsContainer);
        console.log(data);
        if (data) {
            data.then(res => {
                if (res.totalHits > 0) {
                    mountSearchResults(resultsContainer, res);
                }
            });
        }
    });
});

function request(url: string | null) {
    // throw Error("Error in request")!;
    return url ? fetch(url as string).then(res => res.json()) : null;
}

function mountSearchResults(container: HTMLDivElement, results: searchResult): void {
    results.hits.forEach((hit: hit) => {
        const image = createImage(hit.previewURL);
        container.appendChild(image);
    })
}

function createImage(url: string) {
    const image = document.createElement('img');
    image.src = url;
    return image;
}

function clear(element: HTMLElement): void {
    element.innerHTML = '';
}

function buildURL(query: string): string {
    return `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(query)}`;
}