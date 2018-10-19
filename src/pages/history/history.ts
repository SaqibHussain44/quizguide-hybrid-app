import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';

import { ShopkeeperProvider } from '../../providers/shopkeeper/shopkeeper';

@IonicPage()
@Component({
  selector: 'page-history',
  templateUrl: 'history.html',
})
export class HistoryPage {
  
  private currentUser: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http, private storage: Storage, private shopkProvider: ShopkeeperProvider) {
    this.currentUser = {};

    storage.get('topupHistory').then( async (res) => {
      if(res == null) {
        let a = await this.shopkProvider.topupHistory();
        console.log(a);
      }
    });
    storage.get('user').then(obj => {
      this.currentUser = obj;
    });
    
  }


}
