import { Component, OnInit } from '@angular/core';
import { Donation } from '../donation';
import { SeekDonationsService } from '../seek-donations.service';
import { RequestApiService } from '../request-api.service';
import {MyRequest} from '../my-request'
import { Router } from '@angular/router';


@Component({
  selector: 'app-seek-donations',
  templateUrl: './seek-donations.component.html',
  styleUrls: ['./seek-donations.component.css']
})
export class SeekDonationsComponent implements OnInit {

  donationsList: Donation[];
  checkoutItems: Donation[] = [];
  loggedInUserID: string;

  constructor(private seekServices: SeekDonationsService, private requestServices: RequestApiService
    , private router: Router) {

       }



  ngOnInit(): void {
    if(localStorage.getItem('loggedInUserID') == null){ this.router.navigate(['/login'])}
    this.loggedInUserID = localStorage.getItem('loggedInUserID');

    this.seekServices.seekDonations().subscribe(res => {
      this.donationsList = res.donations;
      
    }, error=>console.error(error));
  }

    getItem(donation: Donation){
    this.checkoutItems.push(donation);
    document.getElementById(`get-btn_${donation.did}`).setAttribute('disabled', "true");
  }

  requestItems(){
    this.checkoutItems.forEach(item =>{
      const request:MyRequest ={
        supplyName: item.supplyName,
        time: new Date(Date.now()),
        status: false,
        description: item.unit,
        uid: +this.loggedInUserID,
        did: item.did
      }
      this.requestServices.createRequest(request).subscribe(
        res => {console.log("Request created!"),
          this.router.navigate(['/request'])
      }, error => console.error(error)
        // A~adir ruta a requests
      )
    }
      )

      this.checkoutItems = [];
     
  }
}
