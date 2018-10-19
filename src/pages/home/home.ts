import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';

import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { ShopkeeperProvider } from '../../providers/shopkeeper/shopkeeper';

import { HistoryPage } from '../history/history';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private loader: any;
  private request : FormGroup;
  private price: any;
  private fields: Array<any> ;
  private currentUser: any;
  private showErrMsg: boolean;
  private showPriceZeroError: boolean;
  private selectedFieldIndex = 0;

  constructor(public navCtrl: NavController, public http: Http, private formBuilder: FormBuilder, private storage: Storage, 
  private loadingCtrl: LoadingController, private alertCtrl: AlertController, private shopkProvider: ShopkeeperProvider) {

    this.price = 0;
    this.request = this.formBuilder.group({
      email: ['', Validators.required],
      months: ['', Validators.required],
      pin: ['', Validators.required],
      field: ['', Validators.required],
      price: ['']
    }); 
    
    storage.get('user').then(obj => {
      this.currentUser = obj;
      this.syncFields();
    });

  }

  syncFields() {
    this.http.get("https://quizguide-dev.herokuapp.com/api/fields")
    .subscribe(response => {
        this.fields = response.json();
        console.log(this.fields);
    });
  }

  updatePrice() {    
    for(var i = 0; i < this.fields.length; i++ ){ 
      if(this.request.value.field == this.fields[i].name) {
        this.price = this.fields[i].price * this.request.value.months;
        this.selectedFieldIndex = i;
      }
    }
    this.request.value.price = this.price;
  }

  async submit() {
    this.presentLoading();
    this.updatePrice();

    // error handlers
    if(this.request.value.pin != this.currentUser.pin) {
      this.showErrMsg = true;
      this.dismissLoader();
      return;
    }
    if(this.price == 0) {
      this.showPriceZeroError = true;
      this.dismissLoader();
      return;
    }

    this.showErrMsg = false;
    this.showPriceZeroError = false;

    const result = await this.shopkProvider.topUp(this.request.value, this.currentUser, this.fields[this.selectedFieldIndex]._id);
    this.dismissLoader();

    if(result) {
      if(!result.error) {
        this.alertCtrl.create({
          title: 'Topup Successful!',
          subTitle: 'Your remaining balance is:  ' + this.currentUser.currentCredit,
          buttons: ['OK']
        }).present();
        this.request.reset();
        this.price = 0;
      }
      else {
        this.alertCtrl.create({
          title: 'Topup failed!',
          subTitle: result.error + ' Please try again',
          buttons: ['OK']
        }).present();
        this.request.reset();
        this.price = 0;
      }
    }
    else {
      this.alertCtrl.create({
        title: 'Topup failed!',
        subTitle: 'Sorry, something went wrong. Try again',
        buttons: ['OK']
      }).present();
      this.request.reset();
      this.price = 0;
    }
  }

  presentLoading() {
    this.loader = this.loadingCtrl.create({
      content: "Please wait..."
    });
    this.loader.present();
  }

  dismissLoader() {
    this.loader.dismiss();
  }

  navigate() {
    this.navCtrl.push(HistoryPage);
  }
  logout() {
    this.storage.remove('user').then(re => {
      this.navCtrl.push(LoginPage);
    });
  }

}
