import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';

import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { ShopkeeperProvider } from '../../providers/shopkeeper/shopkeeper';

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
    
    this.syncFields();
    storage.get('user').then(obj => {
      this.currentUser = obj;
    });

  }

  syncFields() {
    this.http.get("/api/fields")
    .subscribe(response => {
        this.fields = response.json();
        console.log(this.fields);
        console.log(this.currentUser);
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
    this.price = 0;
  }

  async submit() {
    this.presentLoading();
    this.updatePrice();
    if(this.request.value.pin != this.currentUser.pin) {
      this.showErrMsg = true;
      this.dismissLoader();
      return;
    }
    this.showErrMsg = false;
    const result = await this.shopkProvider.topUp(this.request.value, this.currentUser, this.fields[this.selectedFieldIndex]._id);
    this.dismissLoader();
    if(result) {
      this.alertCtrl.create({
        title: 'Topup Successful!',
        subTitle: 'Your remaining balance is:  ' + this.currentUser.currentCredit,
        buttons: ['OK']
      }).present();
      this.request.reset();
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

}
