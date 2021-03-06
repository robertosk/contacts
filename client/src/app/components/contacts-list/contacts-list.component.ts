import { Component, OnInit } from '@angular/core';
import { _ } from 'underscore';

import { Contact } from '../../models/contact.model';
import { ContactService } from '../../services/contacts.service';
import { Observable } from 'rxjs';
import { HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contacts-list',
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.css']
})

export class ContactsListComponent implements OnInit {
  public contacts = [];

  selectedContact: Contact;
  rConfirm: string;
  isNewContact: boolean;

  constructor(private contactService: ContactService, private _router: Router) {
    this.rConfirm = '';
    this.isNewContact = false;
  }

  ngOnInit() {
    this.getContacts();
  }

  getContacts() {
    this.contactService.getContacts()
      .subscribe(
        data => {
          this.contacts = data;
        },
        err => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              this._router.navigate(['/login']);
            }
          }
        }
      );
  }

  editContact(contact: Contact): void {
    if (contact) {
      this.selectedContact = JSON.parse(JSON.stringify(contact));
      this.isNewContact = false;
    } else {
      this.selectedContact = new Contact();
      this.isNewContact = true;
    }
  }

  onSaveContact(contact: Contact): void {
    if (this.isNewContact) {
      contact._id = null;
      this.contactService.addContact(contact)
        .subscribe(data => {
          this.contacts.push(data);
        });
    } else {
      this.contactService.editContact(contact)
        .subscribe(data => {
          const iIndex = _.findIndex(this.contacts, function (c) {
            return c._id === data._id;
          });
          this.contacts[iIndex] = this.selectedContact;
        });
    }
    (<any>$('#edit-contact-modal')).modal('hide');
  }

  onRemoveContact(contact: Contact): void {
    this.selectedContact = contact;
  }

  removeContact(contact: Contact): void {
    if (this.rConfirm === contact.firstName) {
      this.contactService.deleteContact(contact).subscribe(data => {
        const iIndex = _.findIndex(this.contacts, function (c) {
          return c._id === data._id;
        });
        this.contacts.splice(iIndex, 1);
        (<any>$('#remove-contact-modal')).modal('hide');
        this.rConfirm = '';
      });
    }
  }

}
