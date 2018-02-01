import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class ShopkeeperProvider {

  public lastTopupId: any;
  constructor(public http: HttpClient, private storage: Storage) {

  }

  // checks wether shopkeeper's currentCredit > requested topup
  isTransactionValid(topupData, shopkeeper) {
    if(shopkeeper.currentCredit >= topupData.price && topupData.price > 0) {
      return true;
    }
    return false;
  }

  // deduct credit from shopKeeper's account
  async deductCredit(shopkeeper, price) {
    shopkeeper.currentCredit = shopkeeper.currentCredit - price;
    shopkeeper.lastTopupId = this.lastTopupId;
    const result = await this.http.post('/api/shopkeepers/topup', shopkeeper).toPromise();
    if(!result.error){
      this.storage.set('user', shopkeeper);
      return result;
    }
    return false;
  } 

  // request server to append a new subscribtion to user's subscription array 
  async performTopup(newSub) {
    var result = await this.http.post('/api/users/topup', newSub).toPromise();
    if(!result.error) {
      try{
        const topUpIdIndex = result._subscriptions.length - 1;
        this.lastTopupId = result._subscriptions[topUpIdIndex]._id;
      }
      catch(e){
        return false;
      }
      return result;
    }
    return false;
  }
  
  calculateEndDate(months) {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + months);
    return currentDate;
  }
  
  // processes user's topUp request
  async topUp(topupData, currentShopkeeper, fieldID) {
    if(this.isTransactionValid(topupData, currentShopkeeper)) {
      const newSubscription = {
        email: topupData.email,
        subscription: {
          field: fieldID,
          status: 'STANDARD',
          dateSubscribed: new Date(),
          endDate: this.calculateEndDate(topupData.months),
          lastPaid: new Date(),
          payments: [{
            datePaid: new Date()
          }]
        }
      };
      const topupStatus = await this.performTopup(newSubscription);
      if(topupStatus) {
        const newShopKeeperCredentials = await this.deductCredit(currentShopkeeper, topupData.price);
        return newShopKeeperCredentials;
      }
      else {
        return {error: 'Email is incorrect or User may not be Registered!'};
      }
    }
    else {
      return {error: 'insufficient balance'};
    }
  }

}
