import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpTransportType, HubConnection, HubConnectionBuilder, IHttpConnectionOptions } from "@microsoft/signalr";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  connection!: HubConnection;
  ConnectionId!: string;
  to: string = "";
  message: string = "";
  user: string = "";
  password: string = "";
  role: string = "";

  conversation: string[] = [];
  loggedUsers: string[] = [];

  constructor(private http: HttpClient) { }
  ngOnDestroy(): void {
    console.log('destroyed');
    
    this.disconnect();
  }

  ngOnInit(): void {
    let builder = new HubConnectionBuilder();
    this.connection = builder.withUrl("https://localhost:5001/broadcast", {
      transport: HttpTransportType.LongPolling,
      accessTokenFactory: () => {
        return this.getToken()
      }
    } as IHttpConnectionOptions).build();

    this.connection.on("ReceiveConnId", data => {
      this.ConnectionId = data;
    });

    this.connection.on("LoggedUsers", data => {
      console.log(data);
      
      if (data == "empty") {
        this.loggedUsers = [];
      } else {
        this.loggedUsers = data;
      }
    });

    this.connection.on("ReceiveMessage", data => {
      this.conversation.push(data);
    });
  }

  getToken(): string {
    let teste = localStorage.getItem('token');

    return teste === null ? "" : teste;
  }

  connect() {
    this.connection.start().then(data => {
      console.log(data);
      
    })
  }

  disconnect() {
    this.connection.stop().then(data => {
      console.log(data);
    })
  }

  sendMessage() {
    if (this.message == "") {
      return;
    }
    var message = JSON.stringify({
      To: this.to,
      Message: this.message
    })
    this.connection.send("SendMessageAsync", message)
  }

  login() {
    console.log('oi');
    
    this.http.post("https://localhost:5001/login", {
      id: 123,
      username: this.user,
      password: this.password,
      role: this.role
    }).subscribe((data: any) => {
      localStorage.setItem('token', data.token);
      console.log(data);
    })
  }
}
