import { Injectable, EventEmitter } from '@angular/core'
import { ElectronService } from './electron.service'
import { SearchType, SongResult, SongSearch } from 'src/electron/shared/interfaces/search.interface'

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private resultsChangedEmitter = new EventEmitter<SongResult[]>() // For when any results change
  private newResultsEmitter = new EventEmitter<SongResult[]>()     // For when a new search happens
  private results: SongResult[] = []
  private awaitingResults = false
  private currentQuery: SongSearch
  private allResultsVisible = true

  constructor(private electronService: ElectronService) { }

  async newSearch(query: string) {
    this.awaitingResults = true
    this.currentQuery = { query, type: SearchType.Any, offset: 0, length: 20 + 1 } // TODO: make length a setting
    this.results = await this.electronService.invoke('song-search', this.currentQuery)
    if (this.results.length > 20) {
      this.results.splice(20, 1)
      this.allResultsVisible = false
    } else {
      this.allResultsVisible = true
    }
    this.awaitingResults = false

    this.newResultsEmitter.emit(this.results)
    this.resultsChangedEmitter.emit(this.results)
  }

  onSearchChanged(callback: (results: SongResult[]) => void) {
    this.resultsChangedEmitter.subscribe(callback)
  }

  onNewSearch(callback: (results: SongResult[]) => void) {
    this.newResultsEmitter.subscribe(callback)
  }

  get resultCount() {
    return this.results.length
  }

  async updateScroll() {
    if (!this.awaitingResults && !this.allResultsVisible) {
      this.awaitingResults = true
      this.currentQuery.offset += 20
      const newResults = await this.electronService.invoke('song-search', this.currentQuery)
      if (newResults.length > 20) {
        newResults.splice(20, 1)
        this.allResultsVisible = false
      } else {
        this.allResultsVisible = true
      }
      this.results.push(...newResults)
      this.awaitingResults = false

      this.resultsChangedEmitter.emit(this.results)
    }
  }
}
