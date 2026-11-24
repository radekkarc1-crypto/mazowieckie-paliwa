# Asystent Nauki

Responsywna aplikacja PWA po polsku do organizowania szkolnych przedmiotów, materiałów, wydarzeń i planu nauki.

## Funkcje
- Przedmioty i tematy z poziomem opanowania oraz trudnością.
- Materiały: notatki, definicje, wyjaśnienia, przykłady, ćwiczenia, testy i odpowiedzi.
- Kalendarz: kartkówki, sprawdziany, odpowiedzi ustne, poprawy, prace domowe i inne wydarzenia.
- Automatyczne sesje nauki na podstawie terminu, trudności i poziomu opanowania.
- Oznaczanie sesji jako wykonanych, przenoszenie zaległości i przeliczanie planu.
- Drukowanie A4 / zapis PDF: notatki, kompaktowa ściąga, pełne opracowanie, test i klucz odpowiedzi.
- Kopia zapasowa JSON do eksportu i przywracania danych.
- Powiadomienia przeglądarkowe po uzyskaniu zgody (w trakcie korzystania z aplikacji).
- Instalowalna aplikacja PWA; dane są przechowywane lokalnie w przeglądarce.

## Uruchomienie lokalne
Wymagany Node.js 22.9 lub nowszy.

```bash
npm start
```

Otwórz `http://localhost:3000`.

## Dane i prywatność
Aplikacja działa bez zewnętrznego API AI i bez konta. Materiały przygotowujesz w ChatGPT, a następnie wprowadzasz do aplikacji. Dane pozostają w pamięci lokalnej przeglądarki. Użyj eksportu JSON, aby utworzyć kopię lub przenieść dane na inne urządzenie.

## Testowanie
```bash
npm test
npm run build
```
