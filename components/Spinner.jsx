import * as React from 'react';
import { Svg, G, Circle, Path } from 'react-native-svg';

const Spinner = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 38 38">
    <G fill="none" fillRule="evenodd">
      <G transform="translate(1 1)" strokeWidth={2}>
        <Circle strokeOpacity=".5" cx={18} cy={18} r={18} stroke={color} />
        <Path
          d="M36 18c0-9.94-8.06-18-18-18"
          stroke={color} // Change to use the passed color prop
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 18 18"
            to="360 18 18"
            dur="1s"
            repeatCount="indefinite"
          />
        </Path>
      </G>
    </G>
  </Svg>
);

export default Spinner;
