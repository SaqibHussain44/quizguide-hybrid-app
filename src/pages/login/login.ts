import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';
import { Http } from '@angular/http';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  private user : FormGroup;
  private currentUser: any;
  private loader: any;
  private showErrMsg: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, private http: Http, private formBuilder: FormBuilder,
    private storage: Storage, private loadingCtrl: LoadingController, private alertCtrl: AlertController ) {

    this.user = this.formBuilder.group({
      phone: ['', Validators.required],
      password: ['', Validators.required]
    });
    // https://quizguide-dev.herokuapp.com/api
  }
  
  authenticate(value) {
    if(value.json().length > 0) {
      const tempUser = value.json()[0];
      if(this.user.value.password == tempUser.password){
        this.currentUser = tempUser;
        return true;
      }
    }
    return false;
  }

  login() {
    this.presentLoading();
    this.http.get('/api/shopKeepers/phone/'+ this.user.value.phone).subscribe(value => {
      if(this.authenticate(value)){
        this.storage.set('user', this.currentUser);
        this.dismissLoader();

        this.alertCtrl.create({
          title: 'Login Successful!',
          subTitle: 'Your 4 digit security pin is: ' + this.currentUser.pin,
          buttons: ['OK']
        }).present();
        
        this.navCtrl.setRoot(HomePage);
      }
      else{
        this.showErrMsg = true;
        this.dismissLoader();
      }
    });
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
