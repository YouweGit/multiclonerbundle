<?php

namespace Youwe\MultiClonerBundle;

use Pimcore\Extension\Bundle\AbstractPimcoreBundle;

class YouweMultiClonerBundle extends AbstractPimcoreBundle
{
    public function getJsPaths()
    {
        return [
            '/bundles/youwemulticloner/js/pimcore/startup.js',
            '/bundles/youwemulticloner/js/pimcore/multiCloner.js'
        ];
    }
}
