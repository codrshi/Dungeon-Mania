import {Artifact} from "../model/artifact.js";

export class ArtifactDao{
    artifact;

    constructor(id){
        this.artifact=new Artifact(id);
    }

    getId() {
        return this.artifact.id;
    }

    setId(id){
        this.artifact.id=id;
    }
}