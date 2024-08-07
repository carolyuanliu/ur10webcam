// src/components/ThreeScene.js
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { OrbitControls } from 'three-stdlib';

const ThreeScene = () => {
    const mountRef = useRef(null);
    const videoRef = useRef(null);

    useEffect(() => {
        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Add lighting
        const light = new THREE.AmbientLight(0xffffff, 1); // Soft white
        scene.add(light);

        // Load 3D model
        const loader = new GLTFLoader();
        loader.load(
            '/model/UR10Rigging_v2.glb',
            (gltf) => {
                const model = gltf.scene;
                scene.add(model);
                // Scale the model
                model.scale.set(0.1, 0.1, 0.1); // Adjust the values as needed

                // Set the position of the model
                model.position.set(0, -3, 0); // Adjust the values as needed
            },
            undefined,
            (error) => {
                console.error('An error occurred while loading the model:', error);
            }
        );

        // Add OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.minDistance = 1;
        controls.maxDistance = 1000;
        controls.maxPolarAngle = Math.PI / 2;

        // Setup webcam video
        const setupCamera = async () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                
                const videoTexture = new THREE.VideoTexture(videoRef.current);
                videoTexture.minFilter = THREE.LinearFilter;
                videoTexture.magFilter = THREE.LinearFilter;
                videoTexture.format = THREE.RGBFormat;

                scene.background = videoTexture;
            }
        };

        setupCamera();

        // Render loop
        const render = () => {
            requestAnimationFrame(render);
            controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
            renderer.render(scene, camera);
        };
        render();

        // Handle window resizing
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);


        // Cleanup on unmount
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
            }
            mountRef.current.removeChild(renderer.domElement);
            window.removeEventListener('resize', handleResize);
            scene.clear();
            renderer.dispose();
        };
    }, []);

    return (
        <div>
            <video ref={videoRef} style={{ display: 'none' }}></video>
            <div ref={mountRef}></div>
        </div>
    );
};

export default ThreeScene;

