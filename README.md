# BACKEND

Il sistema si prepone di risolvere il problema de monitoraggio di determinati parametri a domicilio con l'obiettivo di visualizzare lo stato di salute di una persona, nel particolare caso in questione un atleta o un paziente.
L'architettura è costituita da:
1. i dispositivi indossabili polar verity sense e polar H10
2. un'app android che permette l'acquisizione dei dati tramite BLE ANT+, la possibilità di aggiungere parametri misurati dall'utente in questione, come pressione arteriosa e diabete, la possibilità di aggiungere eventuali esercizi svolti dall'utente, la possibilitàdi visualizzare i propri dati in modo intellegibile attraverso dei grafici [repo app android](https://github.com/UniSalento-IDALab-IoTCourse-2022-2023/wot-project-part1-AndroidApp-DegiorgiProto)
3. un'app web utilizzabile dal medico che dà la possibilità di visualizzare i propri pazienti e i relativi dati acquisiti e aggiunti attraverso dei grafici [repo app web](https://github.com/UniSalento-IDALab-IoTCourse-2022-2023/wot-project-part3-WebApp-DegiorgiProto)
4. un backend costituito da un server che fa da intermediario con il database che raccoglie i dati acquisiti e che permette quindi di aggiungerli e prelevarli per la visualizzazione, e il database stesso. [repo backend](https://github.com/UniSalento-IDALab-IoTCourse-2022-2023/wot-project-part2-Backend-DegiorgiProto)

![[photo_2023-06-08_11-52-42.jpg]]

## Operazioni preliminari
Bisogna installare le librerie relative al database, all'implementazione delle API e all'implementazione del web socket
```shell
npm install mongodb
npm install express
npm install ws
```

Questa repository riguarda l'implementazione di un server node.js che inizialmente instaura una connessione al database mongoDB e successivamente mette a disposizione delle API per inserire, prelevare e cancellare i dati all'interno del database. 
Inoltre è stato istanziato un web socket per la gestione di eventuali notifiche verso l'app android da parte del server.
La scalabilità del server permette la connessione dell'app android e dell'app web e la creazione delle API utilizzabili da entrambe.

### ATTENZIONE
Tutti gli URL utilizzati sono personalizzabili; c'è infatti la possibilità di cambiare l'indirizzo IP con il proprio indirizzo corrispondente dalla wlan, con localhost o con un indirizzo IP corrispondente ad un servizio Cloud, a seconda di dove si trova il server e il database.
In questo caso specifico l'idea è stata di usare il servizio AWS EC2 su cui istanziare il database.