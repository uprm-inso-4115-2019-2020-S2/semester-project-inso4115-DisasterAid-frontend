import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { UserApiService } from '../userapi.service';
import { Subscription } from 'rxjs/Subscription';
import { User } from '../user';
import { Supply } from '../supply';

import { User1 } from '../user';
import { Router } from '@angular/router';
import { DonationsService } from '../donations.service';
import { Donation } from '../donation';
import { MyRequest } from '../my-request';
import { RequestApiService } from '../request-api.service';
import { disableDebugTools } from '@angular/platform-browser';
import 'rxjs/add/operator/shareReplay';




@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  userListSubs: Subscription;
  userList: User[];
  loggedInUser: User;
  mySuppliesList: Donation[] = [];
  @Input() searchModel: string;  


  pending = [new User1(1, 'Carlos J. Ayala'), new User1(2, 'Javier'), new User1(2, 'Javier')
    , new User1(2, 'Javier'), new User1(2, 'Javier'), new User1(2, 'Javier'), new User1(2, 'Javier')
    , new User1(2, 'Javier'), new User1(2, 'Javier'), new User1(2, 'Javier'), new User1(2, 'Javier')];  //FOR TESTING
  delivered = [new User1(3, 'Juan Del Pueblo'), new User1(4, 'Los $1200')];  //FOR TESTING
  numOfRequests: number; //Displays the number of requests in the home page
  numOfDonations: number; //Displays the number of donations in the home page

  constructor(private userApi: UserApiService, private router: Router,
    private donationApi: DonationsService, private requestsApi: RequestApiService) { }

  //Mock data; in practicality, these will be loaded with the info from db. 
  //user type should be User
  user = {
    firstName: this.loggedInUser ? this.loggedInUser.firstName : '',
    lastName: this.loggedInUser ? this.loggedInUser.lastName : ''
  }

 
  //mock delivered list (should be loaded from db)
  //List Type should be User.
  deliveredList: String[] = []

  //mock supplies list (to be loaded from db)
  //List should be of type Supply[]


  //mock resources list (to be loaded from db)
  //List should be of type Supply[]
  //Para los supplies la lista es : food, water, blankets, clothes, medicine, batteries y tools
  // OJO - para que funcionen las fotos los names tienen que empezar con lowercase
  incomingRequestsList: MyRequest[] = [];

  ngOnInit(): void {

    if (localStorage.getItem('loggedInUserID') == null) { this.router.navigate(['/login']) }

    this.userApi
      .getUserById(localStorage.getItem('loggedInUserID')).subscribe(res => {
        this.loggedInUser = res.user;
        this.user.firstName = res.user.firstName;
        this.user.lastName = res.user.lastName;
      },
        error => console.log(error)
      );

    this.getThisUsersDonations();
    this.fillDeliveredDonationsList();

  }

  ngOnDestroy(): void {

  }

  onClickList(e) {
    console.log(e.target.id);
    //DO THE SEACH WITH e.target.id QUE ES EL NOMBRE DEL PUEBLO
    localStorage.setItem('search',String(e.target.id));
    this.router.navigate(['/seek-donations'])
    // window.location.href = '/donations/'  
  }

  makeSearch(){
    console.log(this.searchModel);
    localStorage.setItem('search',this.searchModel);
    this.router.navigate(['/seek-donations'])
  }

  logout() {
    console.warn("Stepping out, bye.")
    this.userApi.logout().subscribe(
      res => {
        localStorage.removeItem('loggedInUserID'),
          this.router.navigate(['/landing_page'])
      }, error => console.error(error)
    )
    // Add this.auth.logout(); HERE
  }

  getThisUsersDonations() {
    this.donationApi.getUserDonations(localStorage.getItem('loggedInUserID')).subscribe(
      res => {
        res.donation.forEach(don =>
          {if(don.quantity>0){
            this.mySuppliesList.push(don);
          }}
        )
        this.numOfDonations = this.mySuppliesList.length;
        this.populateIncomingRequestList();
      }, error => console.error(error)
    )
  }

  populateIncomingRequestList() {
    this.mySuppliesList.forEach(supply =>
      {supply.requests.forEach(item => 
        {if (item.status!="Delivered"){
          this.incomingRequestsList.push(item);
        }});
    this.numOfRequests = this.incomingRequestsList.length});
  }


  acceptRequest(requestId: string, donationId: string) {

    console.log(requestId);
    this.requestsApi.getRequestById(requestId).subscribe(
      res => {
        console.log(res)
        const rte: MyRequest = {
          rId: +requestId,
          supplyName: res.requests.supplyName,
          time: res.requests.time,
          status: "Accepted",
          description: res.requests.description,
          donation: res.requests.donation,
          user: res.requests.user,
          uid: res.requests.uid,
          did: res.requests.did
        }
        this.saveChangesRequest(rte);

      }, error => console.error(error))

    
  }


  private saveChangesDonation(don: Donation, did: string) {
    console.log(don);
    this.donationApi.editDonation(don, did).subscribe(res => console.log(res), error => console.error(error))
  }

  private saveChangesRequest(req: MyRequest) {
    console.log(req);
    this.requestsApi.editRequest(req).subscribe(res => {console.log(res); this.refreshPage();}, error => console.error(error))
  }

  deliverRequest(requestId: string, donationId: string) {

    console.log(requestId);
    this.requestsApi.getRequestById(requestId).subscribe(
      res => {
        console.log(res)
        const rte: MyRequest = {
          rId: +requestId,
          supplyName: res.requests.supplyName,
          time: res.requests.time,
          status: "Delivered",
          description: res.requests.description,
          donation: res.requests.donation,
          user: res.requests.user,
          uid: res.requests.uid,
          did: res.requests.did
        }
        const dte: Donation = {
          supplyName: res.requests.donation.supplyName,
          quantity: 0,
          unit: res.requests.donation.unit,
          uid: res.requests.donation.uid
        }

        this.saveChangesDonation(dte, donationId);
        this.saveChangesRequest(rte);
        

      }, error => console.error(error))

    
  }

  fillDeliveredDonationsList(){
    this.requestsApi.getAllRequests().subscribe(
      res => {
        console.log(res);
        console.log(+localStorage.getItem('loggedInUserID'));
        res.requests.forEach(mr =>
         { if(mr.status == "Delivered" && mr.donation.uid == +localStorage.getItem('loggedInUserID')){
            this.deliveredList.push(mr.user.firstName +" "+ mr.user.lastName
            + " : "+mr.supplyName +" ( "+ mr.description+" )");
          }}
        )
      },error => console.error(error)
      
    )
  }

  refreshPage(){
    window.location.reload();
  }

}
