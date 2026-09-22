import { useEffect } from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { Box } from './ui/box';
import { Center } from './ui/center';
import { Divider } from './ui/divider';
import { Skeleton, SkeletonText } from './ui/skeleton';
import { VStack } from './ui/vstack';

type SkeletonLoadingProps = {
    skeletonVariant?: "index" | "index2" | "show" | "store"
    itemHeight?: number
};

export default function SkeletonLoading({
    skeletonVariant = "index",
    itemHeight = 80,
}: SkeletonLoadingProps) {
    const opacity = useSharedValue(0.5);
    const variant = 'rounded';

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(1, { duration: 800 }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    if (skeletonVariant === "index") {
        return (
            <Animated.View style={animatedStyle}>
                <VStack space='md' className='p-2'>
                    <SkeletonText
                        _lines={1}
                        className='w-50 h-4'
                    />
                    <SkeletonText
                        _lines={1}
                        className='h-1'
                    />
                    <Skeleton
                        variant={variant}
                        style={{height: itemHeight}}
                    />
                    <Skeleton
                        variant={variant}
                        style={{height: itemHeight}}
                    />
                    <Skeleton
                        variant={variant}
                        style={{height: itemHeight}}
                    />
                    <SkeletonText
                        _lines={1}
                        className='w-50 h-4'
                    />
                    <SkeletonText
                        _lines={1}
                        className='h-1'
                    />
                    <Skeleton
                        variant={variant}
                        style={{height: itemHeight}}
                    />
                    <Skeleton
                        variant={variant}
                        style={{height: itemHeight}}
                    />
                    <Skeleton
                        variant={variant}
                        style={{height: itemHeight}}
                    />
                    <Skeleton
                        variant={variant}
                        style={{height: itemHeight}}
                    />
                    <Skeleton
                        variant={variant}
                        style={{height: itemHeight}}
                    />
                </VStack>
            </Animated.View>
        );
    }

    if (skeletonVariant === "index2") {
        return (
            <Animated.View style={animatedStyle}>
                <VStack space='md' className='p-2'>
                    <Skeleton
                        variant={variant}
                        style={{height: itemHeight}}
                    />
                    <Skeleton
                        variant={variant}
                        style={{height: itemHeight}}
                    />
                    <Skeleton
                        variant={variant}
                        style={{height: itemHeight}}
                    />
                    <Skeleton
                        variant={variant}
                        style={{height: itemHeight}}
                    />
                    <Skeleton
                        variant={variant}
                        style={{height: itemHeight}}
                    />
                    <Skeleton
                        variant={variant}
                        style={{height: itemHeight}}
                    />
                    <Skeleton
                        variant={variant}
                        style={{height: itemHeight}}
                    />
                    <Skeleton
                        variant={variant}
                        style={{height: itemHeight}}
                    />
                </VStack>
            </Animated.View>
        );
    }

    if (skeletonVariant === "show") {
        return (
            <Animated.View style={animatedStyle}>
                <VStack space="lg" className="p-2">
                    <Center className='mb-2 mt-3'>
                        <Skeleton className="w-35 h-35" />
                    </Center>

                    <VStack
                        space="lg"
                        className="items-center"
                    >
                        <Box className=''>
                            <SkeletonText
                                _lines={1}
                                className="w-50 h-4 mb-2"
                            />
                            <SkeletonText
                                _lines={1}
                                className="w-50 h-4"
                            />
                        </Box>
                        <Box className='w-90'>
                            <Divider className=''/>
                        </Box>
                        <Box className=''>
                            <SkeletonText
                                _lines={1}
                                className="w-50 h-4 mb-2"
                            />
                            <SkeletonText
                                _lines={1}
                                className="w-50 h-4"
                            />
                        </Box>
                        <Box className='w-90'>
                            <Divider className=''/>
                        </Box>
                        <Box className=''>
                            <SkeletonText
                                _lines={1}
                                className="w-50 h-4 mb-2"
                            />
                            <SkeletonText
                                _lines={1}
                                className="w-50 h-4"
                            />
                        </Box>
                        <Box className='w-90'>
                            <Divider className=''/>
                        </Box>
                        <Box className=''>
                            <SkeletonText
                                _lines={1}
                                className="w-50 h-4 mb-2"
                            />
                            <SkeletonText
                                _lines={1}
                                className="w-50 h-4"
                            />
                        </Box>
                        <Box className='w-90'>
                            <Divider className=''/>
                        </Box>
                        <Box className='flex-row w-75 justify-between'>
                            <Box className='justify-center'>
                                <Center className='mb-3'>
                                    <Skeleton className='h-20 w-20' variant='circular' />
                                </Center>
                                <Center>
                                    <SkeletonText
                                        _lines={1}
                                        className="w-30 h-4 mb-2"
                                    />
                                    <Box>
                                        <SkeletonText
                                            _lines={1}
                                            className="w-20 h-4 mb-2"
                                        />
                                        <SkeletonText
                                            _lines={1}
                                            className="w-20 h-4 mb-2"
                                        />
                                    </Box>
                                    
                                </Center>
                            </Box>
                            <Box className='justify-center'>
                                <Center className='mb-3'>
                                    <Skeleton className='h-20 w-20' variant='circular' />
                                </Center>
                                <Center>
                                    <SkeletonText
                                        _lines={1}
                                        className="w-30 h-4 mb-2"
                                    />
                                    <Box>
                                        <SkeletonText
                                            _lines={1}
                                            className="w-20 h-4 mb-2"
                                        />
                                        <SkeletonText
                                            _lines={1}
                                            className="w-20 h-4 mb-2"
                                        />
                                    </Box>
                                    
                                </Center>
                            </Box>
                        </Box>
                        <Box className='w-90'>
                            <Divider className=''/>
                        </Box>
                        <Box className=''>
                            <SkeletonText
                                _lines={1}
                                className="w-50 h-4 mb-2"
                            />
                            <SkeletonText
                                _lines={1}
                                className="w-50 h-4"
                            />
                        </Box>
                        <Box className='w-90'>
                            <Divider className=''/>
                        </Box>
                    </VStack>
                </VStack>
            </Animated.View>
        )
    }

    if (skeletonVariant === "store") {
        return (
            <Animated.View style={animatedStyle}>
                <VStack space='md' className='p-5'>
                    <Box>
                        <SkeletonText
                            _lines={1}
                            className="w-30 h-4 mb-4"
                        />
                        <Box className='flex-row justify-between'>
                            <Box>
                                <Skeleton className='w-41 h-10' />
                            </Box>
                            <Box>
                                <Skeleton className='w-41 h-10' />
                            </Box>
                        </Box>
                    </Box>
                    <Divider />
                    <Box>
                        <SkeletonText
                            _lines={1}
                            className="w-30 h-4 mb-4"
                        />
                        <Skeleton className='w-full h-10' />
                    </Box>
                    <Divider />
                    <Box>
                        <SkeletonText
                            _lines={1}
                            className="w-30 h-4 mb-4"
                        />
                        <Skeleton className='w-full h-30' />
                    </Box>
                    <Divider />
                    <Box>
                        <SkeletonText
                            _lines={1}
                            className="w-30 h-4 mb-4"
                        />
                        <Skeleton className='w-full h-10' />
                    </Box>
                    <Divider />
                    <Box>
                        <SkeletonText
                            _lines={1}
                            className="w-30 h-4 mb-4"
                        />
                        <Skeleton className='w-full h-10' />
                    </Box>
                    <Divider />
                    <Box>
                        <SkeletonText
                            _lines={1}
                            className="w-30 h-4 mb-4"
                        />
                        <Skeleton className='w-full h-10 mb-2' />
                        <SkeletonText
                            _lines={1}
                            className="w-60 h-3 mb-1"
                        />
                        <SkeletonText
                            _lines={1}
                            className="w-30 h-3"
                        />
                    </Box>
                    <Skeleton className='w-full h-10' />
                </VStack>
            </Animated.View>
        )
    }

}