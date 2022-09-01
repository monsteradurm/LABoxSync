/* eslint-disable */

import * as _ from 'underscore';
import { BoxConfig } from './environment';

const BoxSDK = require('box-node-sdk');

export class BoxService {

    public static SDK = BoxSDK.getPreconfiguredInstance(BoxConfig);
    public Client;

    public GetClient() {
        // return BoxHelper.SDK.getAppAuthClient('user', environment.box.user);
        return BoxService.SDK.getAppAuthClient('enterprise', BoxConfig.enterpriseID);
    }

    public async GetShareFolder(root: string, folder: string) {
        const entry = await this.get_subfolder(root, folder);
        if (!entry) { return null; }

        return entry.shared_link;

    }

    public async GetThumbnail(id: string) {
        return await this.Client.files.getThumbnail(id);
    }

    public async GetThumbnails(ids: string[]) {
        const result = {};
        for (const id of ids) {
            result[id] = await this.Client.files.getThumbnail(id);
        }

        return result;
    }

    public async GetFileSharedLink(id: string) {
        const shared = await this.Client.files.update(id, {
            shared_link: {
                access: 'open',
                permissions: {
                can_download: true
                }
            }
        });

        return shared;
    }

    public async GetSubFolderItems(root: string, folder: string) {
        const entry = await this.get_subfolder(root, folder);
        if (!entry) { return null; }

        return await this.GetFolderItems(entry.id);
    }

    public async GetSubFolder(root: string, folder: string) {
        console.log('Getting Folder Itens ' + root);
        const folders = await this.GetFolderItems(root);

        console.log(folders);
        if (!folders || !folders.entries) {
            return null;
        }

        const subfolder =  _.find(folders.entries, f => f.type == 'folder' && f.name.toLowerCase() == folder.toLowerCase());

        return subfolder ? subfolder : null;
    }

    public async get_subfolder(root: string, folder: string) {
        const folders = await this.GetFolderItems(root);

        if (!folders || !folders.entries) {
            return null;
        }

        const result =  _.find(folders.entries, f => f.type == 'folder' && f.name.toLowerCase() == folder.toLowerCase());

        if (result.shared_link != null) {
            return result;
        }

        console.log('Attempting to Update Folder: ', result);
        const shared = await this.Client.folders.update(result.id, {
            shared_link: {
                access: 'open',
                permissions: {
                    can_download: true
                }
            }
        });

        return shared;
    }

    public async GetFolderInfo(id) {
        console.log('Getting Folder Info: ' + id);
        const result = await this.Client.folders.get(id, { fields: 'name,shared_link,type,path_collection' });
        console.log(result);
        return result;
    }

    public async GetFolderItems(parent) {
        console.log('Getting Folder Items ' + parent);
        return await this.Client.folders.getItems(parent, { fields: 'name,shared_link,type,path_collection,tags', offset: 0, limit: 1000});
    }

    public async get_webhook(id) {
        return await this.Client.webhooks.get(id);
    }

    constructor() {
        this.Client = this.GetClient();
    }
}
