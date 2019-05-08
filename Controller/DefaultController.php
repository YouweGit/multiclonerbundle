<?php

namespace Youwe\MultiClonerBundle\Controller;

use Pimcore\Bundle\AdminBundle\Controller\AdminController;
use Pimcore\Model\DataObject\Concrete;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DefaultController extends AdminController
{

    /**
     * @Route("/admin/youwe_multi_cloner/clone")
     */
    public function cloneAction(Request $request)
    {
        $cloneCount = $request->get('cloneCount');
        $objectId = $request->get('objectId');
        $parentPath = $request->get('parentPath');
        $moveOriginal = $request->get('moveOriginal', false);
        $openFolder = $request->get('openFolder', false);
        $user = $this->getUser();

        if(!$cloneCount) throw new \InvalidArgumentException('no clone count specified');
        if(!$objectId) throw new \InvalidArgumentException('no object id specified');
        if(!$parentPath) throw new \InvalidArgumentException('no parent path specified');

        $object = Concrete::getById($objectId);

        if(!$object) throw new \Exception('object not found by id ' . $objectId);

        $parentFolder = \Pimcore\Model\DataObject\Service::createFolderByPath($parentPath);

        if(!$parentFolder) throw new \Exception('could not create parent folder');

        if($moveOriginal) {
            $object->setParent($parentFolder);
            $object->save();
        }

        $objectService = new \Pimcore\Model\DataObject\Service($user);
        $createdObjectIds = [];
        if($cloneCount) {
            for($c = 0; $c < $cloneCount; $c++) {
                $new = $objectService->copyAsChild($parentFolder, $object);
                // reset the key and save again because stupid pimcore keeps adding _copy_copy_copy...
                $new->setKey($object->getKey() . '-' . uniqid());
                $new->save();
                $createdObjectIds[] = $new->getId();
            }
        }

        return $this->json([
            'success' => true,
            'createdObjectIds' => $createdObjectIds,
            'cloneCount' => $cloneCount,
            'parentPath' => $parentPath,
            'parentFolderId' => $parentFolder->getId(),
            'moveOriginal' => $moveOriginal,
            'openFolder' => $openFolder,
            'objectId' => $objectId
        ]);
    }

}
