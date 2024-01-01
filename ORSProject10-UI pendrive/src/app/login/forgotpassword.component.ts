import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { HttpServiceService } from '../http-service.service';
import { Router } from '@angular/router';
import { DataValidator } from '../utility/data-validator';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgotpassword.component.html'
})

export class ForgotPasswordComponent implements OnInit {

  endpoint = 'http://localhost:8084/Auth';

  form = {
    error: false,
    message: '',
    loginId: '',
  };

  inputerror = {};
  message = '';

  constructor(private httpService: HttpServiceService, private dataValidator: DataValidator, private router: Router) {
  }


  validate() {
    let flag = true;
    flag = flag && this.dataValidator.isNotNullObject(this.form.loginId);
    console.log('flag:', flag);
    return flag;
  }

  /**
   * Initialize component
   */
  ngOnInit() {
  }

  submit() {
    // tslint:disable-next-line:variable-name
    const _self = this;
    // tslint:disable-next-line:only-arrow-functions
    this.httpService.get(_self.endpoint + '/fp/' + this.form.loginId , function(res) {

      console.log('MyResponse', res);

      _self.form.message = '';
      _self.inputerror = {};
      console.log(res.result.message + '------>msg');
      if (res.result.message) {
        _self.form.message = res.result.message;
        console.log(_self.form.message + '-------> msg in sucess');
      }

      _self.form.error = !res.success;
      if (_self.form.error && res.result.inputerror) {
          _self.inputerror = res.result.inputerror;
      }
    });
  }
}
