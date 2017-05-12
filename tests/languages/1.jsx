import React from 'react';
import {PhotoStory, VideoStory} from './stories';

const components = {
    photo: PhotoStory,
    video: VideoStory
};

function Story(props) {
    // Correct! JSX type can be a capitalized variable.
    const SpecificStory = components[props.storyType];
    return <SpecificStory story={props.story}/>;
}