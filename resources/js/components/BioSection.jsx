import React from 'react';
import {startUpdate, stopUpdate, clamp, rad2deg} from '../utils';

function TextContent(props) {
    return (
        <div className="bio__text-content">
            <header className="bio__header">
                <h1>{props.title}</h1>
                <span className="subtitle">{props.subtitle}</span>
            </header>
            <div className="bio__desc">{props.children}</div>
        </div>
    );
}

class AvatarTags extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.picRef = React.createRef();
        this.calculateRadius = this.calculateRadius.bind(this);
        this.prevScroll = 0;
        this.angularVel = 0;
        this.angle = 0;
    }

    calculateRadius() {
        this.radius = 0.5 * this.ref.current.offsetWidth;
    }

    update(deltaTime) {
        const data = constants.bio.avatar.tags;

        // Calculate scroll change
        const scroll = window.scrollY;
        const deltaScroll = scroll - this.prevScroll;

        // Convert to angle change, velocity and direction
        const deltaAngle = data.scrollRatio * deltaScroll / this.radius;
        const angularVel = deltaAngle / deltaTime;
        const angularDir = Math.sign(angularVel);

        // If the calculated angular velocity if faster than current, 
        // or in opposite direction, modify current to match.
        if (angularDir !== 0 &&
            (angularDir !== Math.sign(this.angularVel) || 
            Math.abs(angularVel) > Math.abs(this.angularVel))) {
            this.angularVel = angularVel;
        }
        
        // Apply friction
        if (this.angularVel !== 0) {
            const currentAngularDir = Math.sign(this.angularVel);
            this.angularVel -= currentAngularDir * data.friction * Math.sqrt(Math.abs(this.angularVel)) * deltaTime;

            // If angular direction has changed due to friction, clamp to 0.
            if (Math.sign(this.angularVel) !== currentAngularDir)
                this.angularVel = 0;
        }

        // Apply max limit to angular velocity
        this.angularVel = clamp(
            this.angularVel,
            -data.maxAngularVel,
            data.maxAngularVel);
            
        // Apply angular velocity
        this.angle -= this.angularVel * deltaTime;
        this.picRef.current.style.transform = `rotate(${rad2deg(this.angle)}deg)`;
        this.prevScroll = scroll;
    }

    componentDidMount() {
        this.calculateRadius();
        window.addEventListener('resize', this.calculateRadius);
        this.updateId = startUpdate(this.update.bind(this));
    }

    componentWillUnmount() {
        stopUpdate(this.updateId);
        window.removeEventListener('resize', this.calculateRadius);
    }

    render() {
        const data = constants.bio.avatar.tags;
        return (
            <div className="bio-avatar__tags" ref={this.ref}>
                <picture ref={this.picRef}>
                    {/* WARNING: Any changes to these min-width
                        values need to be matched in app.css */}
                    <source media="(min-width: 885px)" srcSet={`${data.imgUrls.large._1x}, ${data.imgUrls.large._2x} 2x`} />
                    <source media="(min-width: 507px)" srcSet={`${data.imgUrls.med._1x}, ${data.imgUrls.med._2x} 2x`} />
                    <img srcSet={`${data.imgUrls.small._1x}, ${data.imgUrls.small._2x} 2x`} alt={data.imgAlt} />
                </picture>
            </div>
        );
    }
}

function Avatar() {
    const imgUrls = constants.bio.avatar.imgUrls;
    const imgAlt = constants.bio.name;
    return (
        <div className="bio-avatar">
            <div className="bio-avatar__disc"></div>
            <div className="bio-avatar__img-cont">
                <img srcSet={`${imgUrls._1x}, ${imgUrls._2x} 2x`} alt={imgAlt}></img>
            </div>
            <AvatarTags />
        </div>
    );
}

function BioSection() {
    const bio = constants.bio;
    return (
        <section id="bio" className="bio tk-lato">
            <TextContent title={bio.name} subtitle={bio.subtitle}>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut purus eleifend tortor tempus auctor. Donec varius, velit eu hendrerit volutpat, odio augue sollicitudin dolor, sed efficitur odio diam <a href="#">vitae ante</a>. Ut sit amet cursus neque hendrerit volutpat.</p>
                <p>Donec varius, velit eu hendrerit volutpat, odio augue sollicitudin dolor, sed efficitur odio.</p>
            </TextContent>
            <Avatar/>
            <div></div> {/* improves flex layout */}
        </section>
    );
}

export default BioSection;
