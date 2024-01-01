import { OnInit } from '@angular/core';
import { ServiceLocatorService } from './service-locator.service';
import { ActivatedRoute } from '@angular/router';
import { HttpServiceService } from './http-service.service';
import { formatNumber } from '@angular/common';
import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';


export class BaseCtl implements OnInit {
  /**
   * Initialize services
   *
   * @param serviceLocator
   * @param route
   */
  constructor(public endpoint, public serviceLocator: ServiceLocatorService, public route: ActivatedRoute) {

    // tslint:disable-next-line:variable-name
    const _self = this;

    console.log('EndPoint:', endpoint);

    _self.initApi(endpoint);

    /**
     * Get primary key from path variale
     */
    // tslint:disable-next-line:only-arrow-functions
    serviceLocator.getPathVariable(route, function(params) {
      _self.form.data.id = params.id;
      console.log('I GOT ID', _self.form.data.id);
    });
  }

  public api = {
    endpoint: null,
    get: null,
    save: null,
    search: null,
    delete: null,
    deleteMany: null,
    preload: null,
    report: null
  };

  /**
   * Form contains preload data, error/sucess message
   */
  public form: any = {

    error: false, // error
    message: null, // error or success message
    preload: [], // preload data
    data: { id: null }, // form data
    inputerror: {}, // form input error messages
    searchParams: {}, // search form
    searchMessage: null, // search result message
    list: [], // search list
    pageNo: 0

  };
  nextList = 0;

  initApi(ep) {
    this.api.endpoint = ep;
    this.api.get = ep + '/get';
    this.api.save = ep + '/save';
    this.api.search = ep + '/search';
    this.api.delete = ep + '/delete';
    this.api.deleteMany = ep + '/deleteMany';
    this.api.preload = ep + '/preload';
    this.api.report = ep + '/report';

    console.log('API', this.api);
  }

  /**
   * Initialize component
   */
  ngOnInit() {
    this.preload();
    if (this.form.data.id && this.form.data.id > 0) {
      this.display();
    }
  }

  /**
   * Loded preload data
   */
  preload() {
    console.log('preload start');
    // tslint:disable-next-line:variable-name
    const _self = this;
    console.log('PreloadApi:', this.api.preload);
    // tslint:disable-next-line:only-arrow-functions
    this.serviceLocator.httpService.get(_self.api.preload, function(res) {
      if (res.success) {
        _self.form.preload = res.result;
      } else {
        _self.form.error = true;
        _self.form.message = res.result.message;
      }
      console.log('FORM', _self.form);
    });
  }

  validate() {
    return this.validateForm(this.form.data);
  }

  /**
   * Override by childs
   *
   * @param form
   */
  validateForm(form) {
  }


  /**
   * Searhs records
   */
  search() {
    console.log('search start');
    // tslint:disable-next-line:variable-name
    const _self = this;
    console.log('Search Form', _self.form.searchParams);
    // tslint:disable-next-line:only-arrow-functions
    this.serviceLocator.httpService.post(_self.api.search + '/' + _self.form.pageNo, _self.form.searchParams, function(res) {


      if (res.success) {
        _self.form.list = res.result.data;
        _self.nextList = res.result.nextList;


        if (_self.form.list.length === 0) {
          _self.form.message = 'No record found';
          _self.form.error = true;
        }
        console.log('List Size', _self.form.list.length);
      } else {
        _self.form.error = false;
        _self.form.message = res.result.message;
      }
      console.log('FORM', _self.form);
    });
  }

  // tslint:disable-next-line:ban-types
  searchOperation(operation: String) {
    console.log('previous/next search start');
    // tslint:disable-next-line:variable-name
    const _self = this;
    console.log('Search Form', _self.form.searchParams);
    // tslint:disable-next-line:only-arrow-functions
    this.serviceLocator.httpService.post(_self.api.search + '/' + _self.form.pageNo, _self.form.searchParams, function(res) {

      if (operation === 'next' || operation === 'previous') {
        _self.nextList = res.result.nextList;
        _self.form.message = null;
        _self.form.error = false;
      }

      if (res.success) {
        _self.form.list = res.result.data;
        if (_self.form.list.length === 0) {
          _self.form.message = 'No record found';
          _self.form.error = true;
        }
        console.log('List Size', _self.form.list.length);
      } else {
        _self.form.error = false;
        _self.form.message = res.result.message;
      }
      console.log('FORM', _self.form);
    });
  }

  /**
   * Contains display logic. It fetches data from database for the primary key
   */
  display() {

    // tslint:disable-next-line:variable-name
    const _self = this;
    console.log('Inside display method');
    // tslint:disable-next-line:only-arrow-functions
    this.serviceLocator.httpService.get(_self.api.get + '/' + _self.form.data.id, function(res) {
      _self.form.data.id = 0;
      if (res.success) {
        _self.populateForm(_self.form.data, res.result.data);
      } else {
        _self.form.error = true;
        _self.form.message = res.result.message;
      }
      console.log('FORM', _self.form);
    });
  }

  /**
   * Populate HTML form data
   * Overridden by child classes.
   *
   * @param form
   * @param data
   */
  populateForm(form, data) {
    form.id = data.id;
    console.log(form.id + 'formid in base ctl');
  }

  /**
   * Contains submit logic. It saves data
   */


  submit() {
    // tslint:disable-next-line:variable-name
    const _self = this;

    console.log(this.form + 'submit running start');
    console.log('form data going to be submit' + this.form.data);
    //  console.log("form data going to be submit" + this.studentId);
    this.serviceLocator.httpService.post(this.api.save, this.form.data, function(res) {
      _self.form.message = '';
      _self.form.inputerror = {};

      if (res.success) {
        _self.form.message = 'Data is saved';
        _self.form.data.id = res.result.data;

        console.log(_self.form.data.id);
        //  console.log("--------------------.");
        // return _self.form.data.id ;
      } else {
        _self.form.error = true;
        if (res.result.inputerror) {
          _self.form.inputerror = res.result.inputerror;
        }
        _self.form.message = res.result.message;
      }
      _self.form.data.id = res.result.data;
      console.log('FORM', _self.form);
    });
  }

  delete(id, callback?) {
    // tslint:disable-next-line:variable-name
    const _self = this;
    this.serviceLocator.httpService.get(_self.api.delete + '/' + id, function(res) {
      if (res.success) {
        _self.form.message = 'Data is deleted';
        if (callback) {
          console.log('Response Success and now Calling Callback');
          //  callback();
          this.search();
        }
      } else {
        _self.form.error = true;
        _self.form.message = res.result.message;
      }
    });
  }

  deleteMany(id, callback?) {
    // tslint:disable-next-line:variable-name
    const _self = this;
    // tslint:disable-next-line:only-arrow-functions
    this.serviceLocator.httpService.post(_self.api.deleteMany + '/' + id, this.form.data, function(res) {
      if (res.success) {
        _self.form.message = 'Data is deleted';

        if (callback) {
          console.log('Response Success and now Calling Callback');
          _self.form.list = res.result.data;
          console.log('List ::  ', + res.data);
          console.log('List Size', _self.form.list.length);
          //  callback();
        }
      } else {
        _self.form.error = true;
        _self.form.message = res.result.message;
      }
    });
  }


  generateReport() {
    // tslint:disable-next-line:variable-name
    const _self = this;
    console.log('********* Generating Report ********************');
    // tslint:disable-next-line:only-arrow-functions
    this.serviceLocator.httpService.get(_self.api.report, function(res) {

      if (res.success) {
        console.log('*********  Report Generated ********************');
        alert('pass');

      } else {
        console.log('********* Error in Generating Report  ********************');
        alert('fail');
      }
    });

  }
  /**
   * Forward to page
   * @param page
   */

  forward(page) {
    console.log(page + '--->>page value');
    this.serviceLocator.forward(page);
  }

}
