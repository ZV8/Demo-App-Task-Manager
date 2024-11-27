import React from 'react';
import { Box, Skeleton as MuiSkeleton } from '@mui/material';
import { styled, keyframes } from '@mui/system';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const StyledSkeleton = styled(MuiSkeleton)`
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0)
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
`;

interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
  count?: number;
  spacing?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width = '100%',
  height = 60,
  count = 1,
  spacing = 1,
}) => {
  return (
    <Box sx={{ width: width }}>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ mb: index < count - 1 ? spacing : 0 }}>
          <StyledSkeleton
            variant={variant}
            width={width}
            height={height}
            animation="wave"
          />
        </Box>
      ))}
    </Box>
  );
};
