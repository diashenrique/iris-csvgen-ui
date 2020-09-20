import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from '@angular/common/http';
import { ToastrService,GlobalConfig } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner"; 


@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})

export class FileUploadComponent implements OnInit {
  form: FormGroup;
  toast_options:GlobalConfig;
  submitted = false;

  constructor(
    public fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private SpinnerService: NgxSpinnerService,

  ) {
    this.form = this.fb.group({
      separator: ['',[Validators.required, Validators.maxLength(1)]],
      tableName: ['',Validators.required],
      file: [null,Validators.required]
    })
    this.toast_options = this.toastr.toastrConfig;

  }

  ngOnInit() { }

  uploadFile(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({
      file: file
    });
    this.form.get('file').updateValueAndValidity()
  }

  reset() {
    this.submitted = false;
    this.form.reset();
  }

  submitForm() {

    this.submitted = true;

    if (this.form.invalid) {
      if (this.form.get('file').value === null){
        let that = this;

        that.open_toast("Error in sending File to Intersystems IRIS for Health.", "File is mandatory", "error")

      }
      return;
    }

    var formData: any = new FormData();
    let body = {
      "separator": this.form.get('separator').value,
      "tableName": this.form.get('tableName').value
    }
    var stringBody = JSON.stringify(body)
    formData.append("body", stringBody);
    formData.append("file", this.form.get('file').value)
    this.SpinnerService.show();  
    this.http.post('http://localhost:52773/api/csvgen/import', formData).subscribe((data: any) => {

      this.SpinnerService.hide();
      var that = this;

      that.open_toast("Success", "File successfully sent to Intersystems IRIS for Health.", "success")

      this.reset()

  }, error => {
      var that = this;
      console.log("There was an error importing file", error);
      that.open_toast("Error in sending File to Intersystems IRIS for Health.", error.error.summary, "error")

  })
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }


  open_toast(title:string, message:string, type:string) {
    this.toast_options.positionClass = "toast-bottom-center"
    if (type == "success") {
        this.toastr.success(message, title);
    } else {
        this.toastr.error(message, title);
    }
}


}