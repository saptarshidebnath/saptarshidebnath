import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss']
})
export class BackgroundComponent implements OnInit {

  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private mesh: THREE.Mesh;
  private scene: THREE.Scene;

  private sunLight: THREE.DirectionalLight;

  private domElementId: string;
  private isWebGLEnabled: boolean;
  constructor() {
    this.domElementId = 'app-background';
  }

  ngOnInit() {
    this.isWebGLEnabled = this.detectWebGLContext();
    if (this.isWebGLEnabled) {
      this.createRender();
      this.setUpCamera();
      this.setupScene();
      this.animate();
    }
  }

  private setUpCamera() {
    this.camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
    this.camera.position.z = 400;
  }

  private setupScene() {
    this.scene = new THREE.Scene();
    const texture: THREE.Texture = new THREE.TextureLoader().load( 'assets/sprites/crate.gif' );
    this.mesh = new THREE.Mesh( new THREE.BoxBufferGeometry( 200, 200, 200 ), new THREE.MeshBasicMaterial( { map: texture } ) );
    this.scene.add( this.mesh );
  }

  private createRender() {
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById(this.domElementId).appendChild( this.renderer.domElement );
    window.addEventListener( 'resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize( window.innerWidth, window.innerHeight );
    }, false );
  }
  private animate() {
    requestAnimationFrame( this.animate.bind(this) );
    this.mesh.rotation.x += 0.005;
    this.mesh.rotation.y += 0.01;
    this.renderer.render( this.scene, this.camera );
  }

  private detectWebGLContext (): boolean {
      const canvas = document.createElement('canvas');
      const webglContextNames: string[] = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'];
      return webglContextNames
      .map((name) => canvas.getContext(name))
      .some((gl) => gl instanceof WebGLRenderingContext);
  }
}
