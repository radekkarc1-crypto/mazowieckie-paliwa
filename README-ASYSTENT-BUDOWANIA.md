# Asystent Budowania

Responsywna aplikacja do importowania i czytania instrukcji krok po kroku. Bez chatbota, modeli AI i wywołań API AI.

## Funkcje wersji 1
- Import pakietów JSON z walidacją (limit 5 MB i 500 kroków)
- Biblioteka projektów i pasek postępu
- Czytnik krok po kroku, nawigacja i oznaczanie wykonanych kroków
- Automatyczny zapis postępu w przeglądarce
- Eksport kopii danych i przykładowy pakiet

## Format pakietu
```json
{
  "version": 1,
  "title": "Nazwa projektu",
  "category": "Plane Crazy",
  "description": "Opis",
  "parts": ["Element 1"],
  "steps": [{"title":"Krok 1","description":"Opis wykonania","parts":["Element 1"]}]
}
```

## Dane
Aktualna wersja zapisuje postępy lokalnie w przeglądarce. Synchronizacja Supabase wymaga aktywnego projektu i konfiguracji. Istniejąca baza pozostaje nietknięta.
